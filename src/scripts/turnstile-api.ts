import type { TurnstileRenderOptions } from './turnstile-render-options';

// The subset of the window.turnstile API that Cloudflare's script installs and the contact form uses.
export interface TurnstileApi {
    readonly render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
}
