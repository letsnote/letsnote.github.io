export function composeUrl(urlString: string, newDirectiveParameters?: {metaDirectiveParameter?: string, textDirectiveParameter?: string}){
    const url = new URL(urlString);
    const hashValue = url.hash.split(':~:')[0];
    const fragmentDirective = url.hash.split(':~:')[1];
    const directiveMap = new Map<string, string>();
    if(fragmentDirective){
        const directives = fragmentDirective.split('&');
        directives.forEach(d => {
            let pair = d.split("=");
            directiveMap.set(pair[0], pair[1]);
        })
    }
    if(newDirectiveParameters?.metaDirectiveParameter){
        directiveMap.set("meta", newDirectiveParameters.metaDirectiveParameter);
    }
    if(newDirectiveParameters?.textDirectiveParameter){
        directiveMap.set("text", newDirectiveParameters.textDirectiveParameter);
    }
    const newFragmentDirective = Array.from(directiveMap.entries()).map(([k,v]) => `${k}=${v}`).join('&');
    url.hash = `${hashValue ?? ''}${newFragmentDirective !== '' ? `:~:${newFragmentDirective}` : ''}`;
    return {url, directiveMap};
}