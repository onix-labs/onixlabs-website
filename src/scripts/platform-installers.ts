// The installer URLs rendered into the download button at build time; undefined when a release lacks one.
export interface PlatformInstallers {
    readonly macOSArm: string | undefined;
    readonly macOSIntel: string | undefined;
    readonly windows: string | undefined;
    readonly linux: string | undefined;
}
