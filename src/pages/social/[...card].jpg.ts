import type { APIRoute, GetStaticPathsResult } from 'astro';

import { loadSocialCards } from '../../social/load-social-cards';
import { renderSocialCard } from '../../social/render-social-card';
import type { SocialCard } from '../../social/social-card';
import { toSocialCardPath } from '../../social/to-social-card-path';

interface Props {
    readonly card: SocialCard;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
    return (await loadSocialCards()).map((card: SocialCard) => ({
        params: { card: toSocialCardPath(card.path).replace(/^\/social\//, '').replace(/\.jpg$/, '') },
        props: { card },
    }));
}

export const GET: APIRoute<Props> = async ({ props }: { props: Props }): Promise<Response> => {
    const image: Buffer = await renderSocialCard(props.card);

    return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/jpeg' } });
};
