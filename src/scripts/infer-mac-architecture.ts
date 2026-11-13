import type { GraphicsDetails } from './graphics-details';

// The processor family of a Mac, judged by its graphics, for browsers that won't report it (Safari and Firefox). Apple
// silicon Macs have Apple's own GPUs; Intel Macs have Intel, AMD or NVIDIA ones. Firefox names the GPU ("Apple M1, or
// similar"). Safari calls every one "Apple GPU", but only Apple's own GPUs decode ASTC textures, so it gives itself
// away. A software renderer (a virtual machine, or WebGL turned off) tells us nothing.
export function inferMacArchitecture(graphics: GraphicsDetails | undefined): 'arm' | 'x86' | undefined {
    if (graphics === undefined) {
        return undefined;
    }

    if (/\bApple M\d/u.test(graphics.renderer)) {
        return 'arm';
    }

    if (/Intel|AMD|ATI|Radeon|NVIDIA|GeForce/iu.test(graphics.renderer)) {
        return 'x86';
    }

    if (/\bApple GPU\b/u.test(graphics.renderer)) {
        return graphics.astc ? 'arm' : 'x86';
    }

    return undefined;
}
