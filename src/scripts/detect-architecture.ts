interface HighEntropyValues {
    readonly architecture?: string;
}

interface UserAgentData {
    getHighEntropyValues(hints: ReadonlyArray<string>): Promise<HighEntropyValues>;
}

interface BrowserDetails {
    readonly userAgent: string;
    readonly userAgentData?: UserAgentData;
}

// The processor family a visitor is browsing on, or undefined when the browser won't say. Only Chromium browsers
// report it. The user agent can't be trusted for it on a Mac: every browser says "Intel Mac OS X", even on Apple
// silicon. It's only ever honest on Linux, where ARM builds name themselves.
export async function detectArchitecture(browser: BrowserDetails): Promise<'arm' | 'x86' | undefined> {
    try {
        const values: HighEntropyValues | undefined = await browser.userAgentData?.getHighEntropyValues(['architecture']);

        if (values?.architecture === 'arm' || values?.architecture === 'x86') {
            return values.architecture;
        }
    } catch {
        // The browser refused the hint, which is the same as not knowing.
    }

    return /Linux.*(?:aarch64|arm64)/u.test(browser.userAgent) ? 'arm' : undefined;
}
