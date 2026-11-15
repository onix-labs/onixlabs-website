import { turnstileOrigin } from '../config/turnstile-origin';
import type { TurnstileApi } from './turnstile-api';

const responseFieldName: string = 'cf-turnstile-response';

// Runs Cloudflare Turnstile's bot check on the contact form, which Formspree verifies before it accepts a submission.
// Cloudflare isn't contacted until a visitor starts filling in the form, so nobody who only reads the page is checked.
// The check is unseen unless Cloudflare needs the visitor to tick its "Verify you are human" box, which then appears.
// A visitor who sends before the check has finished sees that it's still running, and the form sends itself once it
// passes. If the check can't run, the form says so and offers the email address instead.
export function initialiseTurnstile(): void {
    const form: HTMLFormElement | null = document.querySelector('form[data-turnstile]');
    const container: HTMLElement | null = form?.querySelector('.turnstile') ?? null;
    const status: HTMLElement | null = form?.querySelector('.form-status') ?? null;

    if (form === null || container === null || status === null) {
        return;
    }

    let isPassed: boolean = false;
    let isFailed: boolean = false;
    let isSendingWhenPassed: boolean = false;

    const fail: () => void = (): void => {
        isFailed = true;
        isSendingWhenPassed = false;
        status.textContent = form.dataset['turnstileFailure'] ?? '';
    };

    const start: () => void = (): void => {
        const script: HTMLScriptElement = document.createElement('script');
        script.src = `${turnstileOrigin}/turnstile/v0/api.js?render=explicit`;
        script.async = true;
        script.addEventListener('error', fail);
        script.addEventListener('load', (): void => {
            const turnstile: unknown = Reflect.get(window, 'turnstile');

            if (!isTurnstileApi(turnstile)) {
                fail();
                return;
            }

            turnstile.render(container, {
                sitekey: form.dataset['turnstile'] ?? '',
                theme: document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark',
                size: 'flexible',
                appearance: 'interaction-only',
                callback: (): void => {
                    isPassed = true;
                    isFailed = false;
                    status.textContent = '';

                    if (isSendingWhenPassed) {
                        form.requestSubmit();
                    }
                },
                'error-callback': fail,
                'expired-callback': (): void => {
                    isPassed = false;
                },
                'before-interactive-callback': (): void => {
                    container.dataset['visible'] = '';
                },
                'after-interactive-callback': (): void => {
                    delete container.dataset['visible'];
                },
            });
        });
        document.head.append(script);
    };

    form.addEventListener('focusin', start, { once: true });
    form.addEventListener('submit', (event: SubmitEvent): void => {
        const response: FormDataEntryValue | null = new FormData(form).get(responseFieldName);

        if (isPassed && typeof response === 'string' && response !== '') {
            return;
        }

        event.preventDefault();

        if (isFailed) {
            fail();
            return;
        }

        isSendingWhenPassed = true;
        status.textContent = form.dataset['turnstilePending'] ?? '';
    });
}

function isTurnstileApi(value: unknown): value is TurnstileApi {
    return typeof value === 'object' && value !== null && typeof Reflect.get(value, 'render') === 'function';
}
