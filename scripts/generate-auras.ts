import { readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import type { Metadata, OutputInfo } from 'sharp';

// The glow behind each glass icon (GlassAura), the Aero image (AeroShowcase) and the Studio and Aero logos (LogoAura) used to be the browser blurring
// a second copy of the image with filter: blur(). iOS Safari clips a filtered layer to its parent's box while an
// ancestor animates, and the blur costs the GPU on every frame, so the glows are rendered here instead: the image on a
// canvas 2.2 times its size (room for the blur to spread), blurred, then graded with the same arithmetic as CSS's
// saturate() and brightness(), and saved beside it as <name>-aura.webp. Re-run it (npm run images) after adding or
// replacing a glass icon.
const imagesRoot: string = path.resolve('public/onixlabs/images');
const padding: number = 0.6; // Each side, as a fraction of the image's width: the canvas is 1 + 2 × padding wide.
const iconBlur: number = 0.26; // The blur's standard deviation, as a fraction of the image's width.
const aeroBlur: number = 0.12; // The Aero image is mostly empty space between its modules, so its colours need less spreading.
const wordmarkBlur: number = 0.2; // Less than an icon's: the Aero wordmark's colours are only a third of its width.
const thickening: number = 0.02; // How far colours spread to join up, as a fraction of the width, before their alpha is raised.
const thickeningGain: number = 8;
const greyChroma: number = 40; // Channels closer together than this make a grey.
const outputWidth: number = 512; // The glow is soft, so it needs far fewer pixels than the image it came from.

interface AuraGrade {
    readonly saturation: number;
    readonly brightness: number;
}

// The dark theme's grade is gentler: its glows sit on near-black, where saturation reads stronger.
const lightGrade: AuraGrade = { saturation: 3.2, brightness: 1.05 };
const darkGrade: AuraGrade = { saturation: 2.6, brightness: 1.15 };
// A logo is flat, full colour rather than pale glass, so it needs far less lifting.
const logoGrade: AuraGrade = { saturation: 1.5, brightness: 1.05 };
const logoDarkGrade: AuraGrade = { saturation: 1.3, brightness: 1.1 };
// The wordmark's colours are small dots all round a ring, so they thin out and mix as they spread.
const wordmarkGrade: AuraGrade = { saturation: 2.6, brightness: 1.05 };
const wordmarkDarkGrade: AuraGrade = { saturation: 2.4, brightness: 1.1 };

async function renderAura(source: string | Buffer, destination: string, grade: AuraGrade, blur: number): Promise<void> {
    const { width }: Metadata = await sharp(source).metadata();
    const pad: number = Math.round(width * padding);
    // The padded image is blurred in the same pipeline as its resize: sharp premultiplies the alpha for a resize and
    // only reverses it at the end, so the blur spreads colour rather than the transparent black around it (which would
    // leave the glow faint and dark-fringed). The blur is relative to the output, which is far quicker than the full size.
    const scaledWidth: number = Math.round(outputWidth / (1 + 2 * padding));
    const padded: Buffer = await sharp(source)
        .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    const { data, info }: { data: Buffer; info: OutputInfo } = await sharp(padded)
        .resize({ width: outputWidth })
        .blur(scaledWidth * blur)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    applyGrade(data, grade);
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .webp({ quality: 85, alphaQuality: 100, effort: 6 }) // Lossless alpha: a lossy one bands across a soft edge.
        .toFile(destination);
    console.log(path.relative(imagesRoot, destination));
}

// CSS's saturate() then brightness(), on straight (not premultiplied) sRGB, clamping after each as the browser does.
// saturate() is the feColorMatrix saturate matrix, which pushes colours out to full vividness rather than scaling their
// chroma perceptually as sharp's modulate() does; that difference is what made the baked glows look duller.
function applyGrade(pixels: Buffer, grade: AuraGrade): void {
    const s: number = grade.saturation;
    const grey: number = 1 - s; // Each channel keeps s of itself and takes (1 - s) of the luminance weights.
    const red: number = 0.2126 * grey;
    const green: number = 0.7152 * grey;
    const blue: number = 0.0722 * grey;
    for (let offset: number = 0; offset < pixels.length; offset += 4) {
        const r: number = pixels.readUInt8(offset);
        const g: number = pixels.readUInt8(offset + 1);
        const b: number = pixels.readUInt8(offset + 2);
        const shared: number = red * r + green * g + blue * b;
        pixels.writeUInt8(clamp(clamp(shared + s * r) * grade.brightness), offset);
        pixels.writeUInt8(clamp(clamp(shared + s * g) * grade.brightness), offset + 1);
        pixels.writeUInt8(clamp(clamp(shared + s * b) * grade.brightness), offset + 2);
    }
}

// The image with everything grey made transparent, so a wordmark's black or white letters don't muddy its glow, and the
// colours that are left thickened until they join up, because sparse ones would blur away to almost nothing. Boosting the
// glow itself instead would show its bands.
async function keepColours(source: string): Promise<Buffer> {
    const { data, info }: { data: Buffer; info: OutputInfo } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let offset: number = 0; offset < data.length; offset += 4) {
        const channels: ReadonlyArray<number> = [data.readUInt8(offset), data.readUInt8(offset + 1), data.readUInt8(offset + 2)];
        if (Math.max(...channels) - Math.min(...channels) < greyChroma) {
            data.writeUInt8(0, offset + 3);
        }
    }
    const { data: thick, info: thickInfo }: { data: Buffer; info: OutputInfo } = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .resize({ width: outputWidth })
        .blur(outputWidth * thickening)
        .raw()
        .toBuffer({ resolveWithObject: true });
    for (let offset: number = 3; offset < thick.length; offset += 4) {
        thick.writeUInt8(clamp(thick.readUInt8(offset) * thickeningGain), offset);
    }
    return sharp(thick, { raw: { width: thickInfo.width, height: thickInfo.height, channels: 4 } }).png().toBuffer();
}

function clamp(value: number): number {
    return Math.min(255, Math.max(0, Math.round(value)));
}

function isAura(file: string): boolean {
    return file.includes('-aura');
}

// Every <name>.webp and <name>-dark.webp in a directory, skipping the auras themselves and any name excluded.
async function auraSources(directory: string, exclude: ReadonlyArray<string> = []): Promise<ReadonlyArray<string>> {
    const files: ReadonlyArray<string> = await readdir(directory);
    return files
        .filter((file: string): boolean => file.endsWith('.webp') && !isAura(file))
        .filter((file: string): boolean => !exclude.includes(file.replace(/(-dark)?\.webp$/, '')))
        .map((file: string): string => path.join(directory, file));
}

async function renderAll(sources: ReadonlyArray<string>, blur: number): Promise<void> {
    await Promise.all(sources.map(async (source: string): Promise<void> => {
        const dark: boolean = source.endsWith('-dark.webp');
        const destination: string = dark ? source.replace(/-dark\.webp$/, '-aura-dark.webp') : source.replace(/\.webp$/, '-aura.webp');
        await renderAura(source, destination, dark ? darkGrade : lightGrade, blur);
    }));
}

await renderAll(await auraSources(path.join(imagesRoot, 'icons/glass')), iconBlur);
// The logos' colours are the same in both themes, so their two glows differ only in their grade.
await renderAura(path.join(imagesRoot, 'logo/studio.svg'), path.join(imagesRoot, 'logo/studio-aura.webp'), logoGrade, iconBlur);
await renderAura(path.join(imagesRoot, 'logo/studio.svg'), path.join(imagesRoot, 'logo/studio-aura-dark.webp'), logoDarkGrade, iconBlur);
const aeroColours: Buffer = await keepColours(path.join(imagesRoot, 'logo/aero-dark.webp'));
await renderAura(aeroColours, path.join(imagesRoot, 'logo/aero-aura.webp'), wordmarkGrade, wordmarkBlur);
await renderAura(aeroColours, path.join(imagesRoot, 'logo/aero-aura-dark.webp'), wordmarkDarkGrade, wordmarkBlur);
await renderAll([path.join(imagesRoot, 'marketing/aero.webp'), path.join(imagesRoot, 'marketing/aero-dark.webp')], aeroBlur);
