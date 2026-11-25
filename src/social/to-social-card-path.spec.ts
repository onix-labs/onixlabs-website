import { describe, expect, it } from 'vitest';

import { toSocialCardPath } from './to-social-card-path';

describe('toSocialCardPath', (): void => {
    it('mirrors the page\'s path', (): void => {
        expect(toSocialCardPath('/Products/DotNet/Core')).toBe('/social/Products/DotNet/Core.jpg');
    });

    it('names the home page\'s card', (): void => {
        expect(toSocialCardPath('/')).toBe('/social/Home.jpg');
    });
});
