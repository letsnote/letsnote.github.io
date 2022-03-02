import { generateFragment, TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils'; 
//TODO: fix the exports field in packages\shell\node_modules\text-fragments-polyfill\package.json

export function getUrlWithTextFragment(): {fullUrl: string, fragment: TextFragment, textDirectiveParameters: string, selectedText: string} | undefined {
    const selection = window.getSelection();
    if (selection && selection.toString() != '') {
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
export function composeUrl(urlString: string, newDirectiveParameters?: { metaDirectiveParameter?: string, textDirectiveParameter?: string }) {
    const url = new URL(urlString);
    const hashValue = url.hash.split(':~:')[0];
    const fragmentDirective = url.hash.split(':~:')[1];
    const directiveMap = new Map<string, string>();
    if (fragmentDirective) {
        const directives = fragmentDirective.split('&');
        directives.forEach(d => {
            let pair = d.split("=");
            const key = pair.splice(0, 1)[0];
            const value = decodeURIComponent(pair.join());
            directiveMap.set(key, value);
        })
    }
    if (newDirectiveParameters?.metaDirectiveParameter) {
        if (newDirectiveParameters.metaDirectiveParameter != "")
            directiveMap.set("meta", newDirectiveParameters.metaDirectiveParameter);
        else
            directiveMap.delete("meta")
    }
    if (newDirectiveParameters?.textDirectiveParameter) {
        if (newDirectiveParameters.textDirectiveParameter != "")
            directiveMap.set("text", newDirectiveParameters.textDirectiveParameter);
        else
            directiveMap.delete("text")
    }
    const newFragmentDirective = Array.from(directiveMap.entries()).map(([k, v]) => `${k}=${v}`).join('&');
    url.hash = `${hashValue ?? ''}${newFragmentDirective !== '' ? `:~:${newFragmentDirective}` : ''}`;
    return { url, directiveMap };
}