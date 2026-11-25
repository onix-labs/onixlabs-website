import type { CardNode } from './card-node';
import { cardTheme } from './card-theme';
import { createBox } from './create-box';
import { createImage } from './create-image';
import type { WindowPicture } from './window-picture';

// The whole screenshot, with the shadow around its window.
const width: number = 728;
const height: number = 565;

// The window, running off the right-hand edge.
export async function composeWindowPicture(picture: WindowPicture): Promise<CardNode> {
    const window: CardNode = await createImage(picture.source, width, height, { position: 'absolute', left: 602, top: 66 });

    return createBox({ position: 'absolute', left: 0, top: 0, width: cardTheme.width, height: cardTheme.height, overflow: 'hidden' }, [window]);
}
