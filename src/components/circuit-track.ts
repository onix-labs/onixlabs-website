import type { CircuitPoint } from './circuit-point';

// One track on the circuit board, from its outer end into the chip, and the electron that runs along it, if any.
export interface CircuitTrack {
    readonly id: string;
    readonly points: ReadonlyArray<CircuitPoint>;
    readonly path: string;
    readonly tone: 'blue' | 'violet' | 'rose';
    readonly electron: boolean;
    readonly duration: number;
    readonly begin: number;
}
