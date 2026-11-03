import type { DesignPage } from './design-page';

export interface DesignGroup {
    readonly title: string;
    readonly pages: ReadonlyArray<DesignPage>;
}
