import type { CardNode } from './card-node';
import { cardTheme } from './card-theme';
import { createBox } from './create-box';
import { createImage } from './create-image';
import type { WindowsPicture } from './windows-picture';

const frontWidth: number = 800;
const aspect: number = 1112 / 1712;

// The screenshots in a stack that runs off the right-hand edge, each in front of the last, lower and larger.
export async function composeWindowsPicture(picture: WindowsPicture): Promise<CardNode> {
    const windows: ReadonlyArray<CardNode> = await Promise.all(picture.screens.map(async (screen: string, index: number): Promise<CardNode> => {
        const depth: number = picture.screens.length - 1 - index;
        const width: number = Math.round(frontWidth * 0.88 ** depth);
        const height: number = Math.round(width * aspect);

        return await createImage(`/onixlabs/images/studio/${screen}-d.webp`, width, height, {
            position: 'absolute', left: 640 + depth * 70, top: 152 - depth * 60, opacity: 1 - depth * 0.25,
        });
    }));

    return createBox({ position: 'absolute', left: 0, top: 0, width: cardTheme.width, height: cardTheme.height, overflow: 'hidden' }, windows);
}
