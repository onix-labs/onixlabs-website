// The subset of Cloudflare Turnstile's render options the contact form uses.
export interface TurnstileRenderOptions {
    readonly sitekey: string;
    readonly theme: 'light' | 'dark';
    readonly size: 'flexible';
    readonly appearance: 'interaction-only';
    readonly callback: () => void;
    readonly 'error-callback': () => void;
    readonly 'expired-callback': () => void;
    readonly 'before-interactive-callback': () => void;
    readonly 'after-interactive-callback': () => void;
}
