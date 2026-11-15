import { initialiseTurnstile } from './initialise-turnstile';
import { prefillContactForm } from './prefill-contact-form';

prefillContactForm(window.location.search);
initialiseTurnstile();
