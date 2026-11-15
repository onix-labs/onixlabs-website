// Stands in for Cloudflare's api.js: render() adds the response field the real widget adds and passes at once, so the
// contact form can be tested without reaching Cloudflare.
export const fakeTurnstile: string = `
window.turnstile = {
    render(container, options) {
        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = 'cf-turnstile-response';
        field.value = 'fake-token';
        container.append(field);
        setTimeout(() => options.callback('fake-token'), 50);
        return 'fake-widget';
    },
};
`;
