import { describe, expect, it } from 'vitest';

import { buildCircuitTracks } from './build-circuit-tracks';
import type { CircuitPoint } from './circuit-point';
import type { CircuitTrack } from './circuit-track';

type Segment = readonly [CircuitPoint, CircuitPoint];

const fadeRadius: number = 425;
const tracks: ReadonlyArray<CircuitTrack> = buildCircuitTracks(500, 112);

function distanceFromCentre([x, y]: CircuitPoint): number {
    return Math.max(Math.abs(x - 500), Math.abs(y - 500));
}

function segments(track: CircuitTrack): ReadonlyArray<Segment> {
    return track.points.slice(1).map((point: CircuitPoint, index: number): Segment => [track.points[index] ?? point, point]);
}

function side(from: CircuitPoint, to: CircuitPoint, point: CircuitPoint): number {
    return Math.sign((to[0] - from[0]) * (point[1] - from[1]) - (to[1] - from[1]) * (point[0] - from[0]));
}

function crosses([a, b]: Segment, [c, d]: Segment): boolean {
    return side(a, b, c) !== side(a, b, d) && side(c, d, a) !== side(c, d, b);
}

describe('buildCircuitTracks', (): void => {
    it('runs seven tracks to each side of the chip, each with a unique id', (): void => {
        expect(tracks).toHaveLength(28);
        expect(new Set(tracks.map((track: CircuitTrack): string => track.id)).size).toBe(28);
    });

    it('ends every track on the chip’s edge, so electrons travel inward', (): void => {
        for (const track of tracks) {
            expect(distanceFromCentre(track.points.at(-1) ?? [0, 0])).toBeCloseTo(112);
        }
    });

    it('starts every track beyond the fade, so none has a visible end', (): void => {
        for (const track of tracks) {
            expect(distanceFromCentre(track.points[0] ?? [500, 500])).toBeGreaterThan(fadeRadius);
        }
    });

    it('keeps the electrons sparse, with some on every side', (): void => {
        const electrons: ReadonlyArray<CircuitTrack> = tracks.filter((track: CircuitTrack): boolean => track.electron);

        expect(electrons).toHaveLength(12);
        expect(new Set(electrons.map((track: CircuitTrack): string => track.tone))).toEqual(new Set(['blue', 'violet', 'rose']));
    });

    it('rounds every corner', (): void => {
        for (const track of tracks) {
            expect(track.path.match(/Q/gu)).toHaveLength(track.points.length - 2);
        }
    });

    it('never crosses one track over another', (): void => {
        const crossings: ReadonlyArray<string> = tracks.flatMap((track: CircuitTrack, index: number): ReadonlyArray<string> =>
            tracks.slice(index + 1)
                .filter((other: CircuitTrack): boolean => segments(track).some((a: Segment): boolean => segments(other).some((b: Segment): boolean => crosses(a, b))))
                .map((other: CircuitTrack): string => `${track.id} crosses ${other.id}`));

        expect(crossings).toEqual([]);
    });
});
