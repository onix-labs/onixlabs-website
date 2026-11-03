// The latest ONIXLabs Studio app release and its installers, one per platform (undefined when a release lacks one).
export interface StudioRelease {
    readonly version: string;
    readonly pageUrl: string;
    readonly macOSAppleSilicon: string | undefined;
    readonly macOSIntel: string | undefined;
    readonly windows: string | undefined;
    readonly linux: string | undefined;
}
