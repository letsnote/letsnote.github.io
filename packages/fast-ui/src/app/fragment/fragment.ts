export function composeUrl(urlString: string, newDirectiveParameters?: { metaDirectiveParameter?: string, textDirectiveParameter?: string }) {
    try {
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
        if (newDirectiveParameters?.metaDirectiveParameter || newDirectiveParameters?.metaDirectiveParameter === "") {
            if (newDirectiveParameters.metaDirectiveParameter !== "")
                directiveMap.set("meta", newDirectiveParameters.metaDirectiveParameter);
            else
                directiveMap.delete("meta");
        }
        if (newDirectiveParameters?.textDirectiveParameter || newDirectiveParameters?.textDirectiveParameter === "") {
            if (newDirectiveParameters.textDirectiveParameter !== "")
                directiveMap.set("text", newDirectiveParameters.textDirectiveParameter);
            else
                directiveMap.delete("text");
        }
        const newFragmentDirective = Array.from(directiveMap.entries()).map(([k, v]) => `${k}=${v}`).join('&');
        url.hash = `${hashValue ?? ''}${newFragmentDirective !== '' ? `:~:${newFragmentDirective}` : ''}`;
        return { url, directiveMap };
    } catch (e) {
        return undefined;
    }
}