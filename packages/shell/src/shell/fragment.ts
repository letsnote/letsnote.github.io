import { generateFragment, TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils'; 
//TODO: fix the exports field in packages\shell\node_modules\text-fragments-polyfill\package.json

export function getUrlWithTextFragment(): {fullUrl: string, fragment: TextFragment, textDirectiveParameters: string, selectedText: string} | undefined {
    const selection = window.getSelection();
    if (selection) {
        const result = generateFragment(selection);
        if (result.status === 0 && result.fragment) {
            let url = `${location.origin}${location.pathname}${location.search}`;
            const fragment = result.fragment;
            const prefix = fragment.prefix ?
                `${encodeURIComponent(fragment.prefix)}-,` :
                '';
            const suffix = fragment.suffix ?
                `,-${encodeURIComponent(fragment.suffix)}` :
                '';
            const textStart = encodeURIComponent(fragment.textStart);
            const textEnd = fragment.textEnd ?
                `,${encodeURIComponent(fragment.textEnd)}` :
                '';
            url += `#:~:text=${prefix}${textStart}${textEnd}${suffix}`;
            console.log(url);
            return {fullUrl: url, fragment: result.fragment, textDirectiveParameters: `${prefix}${textStart}${textEnd}${suffix}`, selectedText: selection.toString()};
        }
    }
}