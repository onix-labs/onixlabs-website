import { describe, expect, it } from 'vitest';

import { inferMacArchitecture } from './infer-mac-architecture';

describe('inferMacArchitecture', (): void => {
    it('reads Apple silicon from the GPU Firefox names', (): void => {
        expect(inferMacArchitecture({ renderer: 'Apple M1, or similar', astc: false })).toBe('arm');
        expect(inferMacArchitecture({ renderer: 'Apple M4 Pro', astc: true })).toBe('arm');
    });

    it('reads Intel from an Intel, AMD or NVIDIA GPU', (): void => {
        expect(inferMacArchitecture({ renderer: 'Radeon R9 200 Series, or similar', astc: false })).toBe('x86');
        expect(inferMacArchitecture({ renderer: 'Intel(R) Iris(TM) Plus Graphics 655', astc: false })).toBe('x86');
        expect(inferMacArchitecture({ renderer: 'AMD Radeon Pro 5500M OpenGL Engine', astc: false })).toBe('x86');
        expect(inferMacArchitecture({ renderer: 'NVIDIA GeForce GT 750M', astc: false })).toBe('x86');
    });

    it('tells Safari’s masked "Apple GPU" apart by ASTC support', (): void => {
        expect(inferMacArchitecture({ renderer: 'Apple GPU', astc: true })).toBe('arm');
        expect(inferMacArchitecture({ renderer: 'Apple GPU', astc: false })).toBe('x86');
    });

    it('doesn’t guess from a software renderer or without WebGL', (): void => {
        expect(inferMacArchitecture({ renderer: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)', astc: true })).toBeUndefined();
        expect(inferMacArchitecture(undefined)).toBeUndefined();
    });
});
