import type { ContactReason } from './contact-reason';

// Keys are the values of the ?reason= query parameter used by links across the site.
export const contactReasons: ReadonlyMap<string, ContactReason> = new Map<string, ContactReason>([
    ['aero-demo', { reason: 'ONIXLabs Aero', message: "Hello. I'd like to see Aero in action." }],
    ['consulting', { reason: 'Consultation', message: "Hello. I'd like to discuss your consultation services." }],
]);
