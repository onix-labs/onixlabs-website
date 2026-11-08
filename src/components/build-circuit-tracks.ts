import type { CircuitPoint } from './circuit-point';
import type { CircuitTrack } from './circuit-track';

interface TrackShape {
    readonly pin: number;
    readonly stem: number;
    readonly shift: number;
    readonly reach: number;
}

interface Side {
    readonly turns: number;
    readonly mirrored: boolean;
    readonly tone: 'blue' | 'violet' | 'rose';
}

const cornerRadius: number = 16;

// The tracks leaving the top of the chip, fanning outward. Tracks must not cross, so further from the middle a track
// bends sooner and shifts further. Every reach runs past the board's fade, so no track has a visible end.
const shapes: ReadonlyArray<TrackShape> = [
    { pin: -75, stem: 18, shift: 112, reach: 220 },
    { pin: -50, stem: 42, shift: 64, reach: 250 },
    { pin: -25, stem: 66, shift: 30, reach: 270 },
    { pin: 0, stem: 96, shift: 0, reach: 260 },
    { pin: 25, stem: 66, shift: 30, reach: 285 },
    { pin: 50, stem: 42, shift: 64, reach: 230 },
    { pin: 75, stem: 18, shift: 112, reach: 240 },
];
const sides: ReadonlyArray<Side> = [
    { turns: 0, mirrored: false, tone: 'blue' },
    { turns: 1, mirrored: true, tone: 'violet' },
    { turns: 2, mirrored: false, tone: 'rose' },
    { turns: 3, mirrored: true, tone: 'violet' },
];

function turn([x, y]: CircuitPoint, turns: number): CircuitPoint {
    return turns === 0 ? [x, y] : turn([-y, x], turns - 1);
}

function coordinate([x, y]: CircuitPoint): string {
    return `${String(Math.round(x * 100) / 100)} ${String(Math.round(y * 100) / 100)}`;
}

// A point on the way from one point to another, a corner's radius short of `from`.
function towards(from: CircuitPoint, to: CircuitPoint): CircuitPoint {
    const distance: number = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const share: number = Math.min(cornerRadius / distance, 0.5);

    return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
}

// Straight runs, with each corner rounded by a curve through it.
function toPath(points: ReadonlyArray<CircuitPoint>): string {
    const corners: ReadonlyArray<string> = points.slice(1, -1).flatMap((corner: CircuitPoint, index: number): ReadonlyArray<string> => {
        const previous: CircuitPoint = points[index] ?? corner;
        const next: CircuitPoint = points[index + 2] ?? corner;

        return [`L${coordinate(towards(corner, previous))}`, `Q${coordinate(corner)} ${coordinate(towards(corner, next))}`];
    });

    return [`M${coordinate(points[0] ?? [0, 0])}`, ...corners, `L${coordinate(points.at(-1) ?? [0, 0])}`].join(' ');
}

// Builds the board around a chip centred on (centre, centre). Every track ends on the chip's edge, so an electron
// following one travels inward.
export function buildCircuitTracks(centre: number, chipEdge: number): ReadonlyArray<CircuitTrack> {
    return sides.flatMap((side: Side, sideIndex: number): ReadonlyArray<CircuitTrack> =>
        shapes.map((shape: TrackShape, shapeIndex: number): CircuitTrack => {
            const pin: number = side.mirrored ? -shape.pin : shape.pin;
            const lean: number = Math.sign(pin) * shape.shift;
            const stem: number = chipEdge + shape.stem;
            const bend: number = stem + shape.shift;
            const outer: number = bend + shape.reach;
            const points: ReadonlyArray<CircuitPoint> = ([[pin + lean, -outer], [pin + lean, -bend], [pin, -stem], [pin, -chipEdge]] as const)
                .map((point: CircuitPoint): CircuitPoint => {
                    const [x, y]: CircuitPoint = turn(point, side.turns);
                    return [x + centre, y + centre];
                });
            const index: number = sideIndex * shapes.length + shapeIndex;
            const duration: number = 3 + (index % 3);

            return {
                id: `track-${String(index)}`,
                points,
                path: toPath(points),
                tone: side.tone,
                electron: shapeIndex % 2 === 1,
                duration,
                begin: -duration * (((index * 7) % 10) / 10),
            };
        }));
}
