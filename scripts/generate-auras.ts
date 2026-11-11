import { readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import type { Metadata, OutputInfo } from 'sharp';

// The glow behind each glass icon (GlassAura) and behind the Aero image (AeroShowcase) used to be the browser blurring
// a second copy of the image with filter: blur(). iOS Safari clips a filtered layer to its parent's box while an
// ancestor animates, and the blur costs the GPU on every frame, so the glows are rendered here instead: the image on a
// canvas 2.2 times its size (room for the blur to spread), blurred, then graded with the same arithmetic as CSS's
// saturate() and brightness(), and saved beside it as <name>-aura.webp. Re-run it (npm run images) after adding or
// replacing a glass icon.
const imagesRoot: string = path.resolve('public/onixlabs/images');
const padding: number = 0.6; // Each side, as a fraction of the image's width: the canvas is 1 + 2 × padding wide.
const iconBlur: number = 0.26; // The blur's standard deviation, as a fraction of the image's width.
const aeroBlur: number = 0.12; // The Aero image is mostly empty space between its modules, so its colours need less spreading.
const outputWidth: number = 512; // The glow is soft, so it needs far fewer pixels than the image it came from.

interface AuraGrade {
    readonly saturation: number;
    readonly brightness: number;
}

// The dark theme's grade is gentler: its glows sit on near-black, where saturation reads stronger.
const lightGrade: AuraGrade = { saturation: 3.2, brightness: 1.05 };
const darkGrade: AuraGrade = { saturation: 2.6, brightness: 1.15 };

async function renderAura(source: string, destination: string, grade: AuraGrade, blur: number): Promise<void> {
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
await renderAll([path.join(imagesRoot, 'marketing/aero.webp'), path.join(imagesRoot, 'marketing/aero-dark.webp')], aeroBlur);
