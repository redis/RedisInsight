import { Selector } from 'testcafe'

export interface EnhancedSelector extends Selector {
    textContentWithoutButtons: Promise<string>;
}

export const createEnhancedSelector = (selector: string): EnhancedSelector => {
    return Selector(selector).addCustomDOMProperties({
        textContentWithoutButtons: el => {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('button').forEach(btn => btn.remove());
            clone.querySelectorAll('svg').forEach(btn => btn.remove());
            return clone.textContent?.trim() ?? '';
        }
    }) as unknown as EnhancedSelector
}
