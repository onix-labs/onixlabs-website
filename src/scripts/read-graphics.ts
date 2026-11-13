import type { GraphicsDetails } from './graphics-details';

// Asks a throwaway WebGL context about the graphics processor, then releases it. Undefined where WebGL is unavailable.
export function readGraphics(): GraphicsDetails | undefined {
    try {
        const context: WebGLRenderingContext | null = document.createElement('canvas').getContext('webgl');

        if (context === null) {
            return undefined;
        }

        const debug: WEBGL_debug_renderer_info | null = context.getExtension('WEBGL_debug_renderer_info');
        const renderer: unknown = context.getParameter(debug === null ? context.RENDERER : debug.UNMASKED_RENDERER_WEBGL);
        const astc: boolean = context.getSupportedExtensions()?.includes('WEBGL_compressed_texture_astc') ?? false;

        context.getExtension('WEBGL_lose_context')?.loseContext();

        return { renderer: typeof renderer === 'string' ? renderer : '', astc };
    } catch {
        return undefined;
    }
}
