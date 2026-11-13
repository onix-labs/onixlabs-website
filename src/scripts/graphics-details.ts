// What WebGL says about the graphics processor: its renderer's name, and whether it decodes ASTC textures.
export interface GraphicsDetails {
    readonly renderer: string;
    readonly astc: boolean;
}
