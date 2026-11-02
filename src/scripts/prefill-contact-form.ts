import type { ContactReason } from './contact-reason';
import { contactReasons } from './contact-reasons';

export function prefillContactForm(search: string): void {
    const key: string | null = new URLSearchParams(search).get('reason');
    const prefill: ContactReason | undefined = key === null ? undefined : contactReasons.get(key);
    const reason: HTMLElement | null = document.getElementById('reason');
    const message: HTMLElement | null = document.getElementById('message');

    if (prefill === undefined) {
        return;
    }

    if (reason instanceof HTMLSelectElement) {
        reason.value = prefill.reason;
    }

    if (message instanceof HTMLTextAreaElement && message.value === '') {
        message.value = prefill.message;
    }
}
