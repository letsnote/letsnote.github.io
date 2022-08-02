import { composeUrl } from '../../fragment/fragment';
import { ItemModel } from '../item/item.component';

export class AnnotationFetchService {
  // constructor(private key: string, private groupId: string) { }
  // annotationList: ItemListModel = { rows: [], total: 0 };

  // async requestAnnotations(length: number) {
  //   const pageCount = Math.floor(length / 200) + 1
  //   for (let i = 0; i < pageCount; i++) {
  //     const got = this.annotationList.rows.length;
  //     await this.updateList(got, ((length - got) > 200) ? 200 : (length - got));
  //   }
  //   return this.annotationList;
  // }

  // private async updateList(skipNumber: number, size: number) {
  //   if (size == 0)
  //     return;
  //   let response = await getAnnotations(this.key, this.groupId, skipNumber, size) as ItemListModel;
  //   response.rows.forEach((row) => {
  //     // The type of item is decided by target > selector 
  //     row.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
  //     updateSomeProperties(row);
  //   });
  //   this.annotationList.rows.push(...response.rows);
  //   this.annotationList.total = response.total;
  // }
  
}

export function updateSomeProperties(row: ItemModel) {
  let itemModel = row as ItemModel;
  const urlResult = composeUrl(itemModel.uri);
  if (urlResult?.directiveMap) {
    try {
      const metaString = urlResult.directiveMap.get('meta');
      if (metaString) {
        const meta: { favicon?: string, selectedText?: string } = JSON.parse(metaString);
        itemModel.favicon = meta.favicon;
        itemModel.textFragment = meta.selectedText;
      }
    } catch (e) {
      console.debug(e);
    }
  }

  // put the text of TextQuoteSelector
  if (!itemModel.textFragment) {
    itemModel.textFragment = itemModel?.target?.map(t => t?.selector?.filter(s => s.type === 'TextQuoteSelector').map(s => s.exact).join('\n')).join('\n');
  }

  if (itemModel.uri.includes('urn:')) {
    itemModel.urlWithoutMeta = new URL(row.links.html);
  } else {
    // Remove the meta directive
    let urlResultWithoutMeta = composeUrl(itemModel.uri, { metaDirectiveParameter: '' });
    itemModel.urlWithoutMeta = urlResultWithoutMeta?.url;
  }
}