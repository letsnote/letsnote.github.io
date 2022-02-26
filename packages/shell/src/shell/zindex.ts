export function getBiggestZIndex(document: Document, window: Window): number {
    let listInShadowDom = Array.from(document.body.getElementsByTagName("*"))
        .filter(e => e.shadowRoot != null)
        .map(e => Array.from((e.shadowRoot as ShadowRoot).querySelectorAll("*")).filter(x => window.getComputedStyle(x, null).getPropertyValue("z-index") != undefined))
        .reduce((p, c, i, arr) => [...p, ...c], []);
    let list = [...document.body.getElementsByTagName("*"),].filter(x => window.getComputedStyle(x, null).getPropertyValue("z-index") != undefined);
    let biggest = 0;
    [...list, ...listInShadowDom].forEach(x => {
        let zIndex = Number.parseInt(window.getComputedStyle(x, null).getPropertyValue("z-index"));
        if (zIndex > biggest)
            biggest = zIndex;
    });
    return biggest;
}