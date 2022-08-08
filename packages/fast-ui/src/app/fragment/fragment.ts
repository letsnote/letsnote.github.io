export function composeUrl(urlString: string, newDirectiveParameters?: { metaDirectiveParameter?: string, encodedTextDirectiveParameter?: string }) {
    try {
        const url = new URL(urlString);
        const hashValue = url.hash.split(':~:')[0];
        const fragmentDirective = url.hash.split(':~:')[1];
        const encodedDirectiveMap = new Map<string, string>();
        if (fragmentDirective) {
            const directives = fragmentDirective.split('&');
            directives.forEach(d => {
                let pair = d.split("=");
                const key = pair.splice(0, 1)[0];
                const value = pair.join();
                encodedDirectiveMap.set(key, value);
            })
        }
        if (newDirectiveParameters?.metaDirectiveParameter || newDirectiveParameters?.metaDirectiveParameter === "") {
            if (newDirectiveParameters.metaDirectiveParameter !== "")
                encodedDirectiveMap.set("meta", encodeURIComponent(newDirectiveParameters.metaDirectiveParameter));
            else
                encodedDirectiveMap.delete("meta");
        }
        if (newDirectiveParameters?.encodedTextDirectiveParameter || newDirectiveParameters?.encodedTextDirectiveParameter === "") {
            if (newDirectiveParameters.encodedTextDirectiveParameter !== "")
                encodedDirectiveMap.set("text", newDirectiveParameters.encodedTextDirectiveParameter);
            else
                encodedDirectiveMap.delete("text");
        }
        const newFragmentDirective = Array.from(encodedDirectiveMap.entries()).map(([k, v]) => `${k}=${v}`).join('&');
        url.hash = `${hashValue ?? ''}${newFragmentDirective !== '' ? `:~:${newFragmentDirective}` : ''}`;
        const decodedMap = new Map(encodedDirectiveMap);
        if(encodedDirectiveMap.has('meta')){
            decodedMap.set('meta', decodeURIComponent(encodedDirectiveMap.get('meta')!));
        }
        return { url, directiveMap: decodedMap};
    } catch (e) {
        return undefined;
    }
}