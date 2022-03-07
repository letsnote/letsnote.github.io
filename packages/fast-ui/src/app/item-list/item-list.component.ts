import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { deleteAnnotation, getAnnotations, updateAnnotation } from 'hypothesis-data';
import { Subscription } from 'rxjs';
import { composeUrl } from '../fragment/fragment';
import { HeaderObserverService } from '../header/header-observer.service';
import { ItemModel, ItemType } from '../item/item.component';
import { ConfigService } from '../setting/config.service';

@Component({
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss', '../style/list.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  model: ItemListModel | undefined;
  groupId: string | undefined;

  keyword: string = '';
  private subscriptions: Subscription[] = [];

  constructor(private hostElement: ElementRef, private config: ConfigService, route: ActivatedRoute, private headerObserver: HeaderObserverService, private changeDetectorRef: ChangeDetectorRef
    , private headerService: HeaderObserverService) {
    let s = route.params.subscribe((param) => {
      this.groupId = param['groupId'];
      this.loadItemList();
    })
    let s2 = this.headerObserver.newNoteObserverble.subscribe((row) => {
      if (this.groupId === row.group)
        this.onItemAddFromHeader(row);
    });
    this.keyword = ''; //TODO
    let s3 = this.headerService.searchInputControl.valueChanges.subscribe((keyword) => {
      this.keyword = keyword;
      this.applyKeywordToNoteList();
    });
    this.subscriptions.push(s, s2, s3);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onFinishEditing(model: ItemModel) {
    updateAnnotation(this.config.key, model.id, { text: model.text });
  }

  async onItemDeleteClick(itemModel: ItemModel) {
    if (this.model) {
      await deleteAnnotation(this.config.key, itemModel.id);
      this.model = { ...this.model, rows: this.model?.rows.filter((m) => m.id != itemModel.id) };
      this.changeDetectorRef.detectChanges(); // TODO: is it right?
    }
  }

  async onItemClick({ model, event }: { model: ItemModel, event: MouseEvent }) {
    if (model.urlWithoutMeta) {
      const currentTab = await chrome.tabs.getCurrent();
      let tab: chrome.tabs.Tab;
      if (event.ctrlKey)
        tab = await chrome.tabs.create({ index: currentTab.index + 1, url: model.urlWithoutMeta.toString(), active: true });
      else if (currentTab.id) {
        chrome.tabs.sendMessage(currentTab.id, { type: 7, data: model.urlWithoutMeta.toString() });
      }
    }
  }

  private async loadItemList() {
    if (this.groupId) {
      let response = await getAnnotations(this.config.key, this.groupId) as ItemListModel;
      response.rows.forEach((row) => {
        // The type of item is decided by target > selector 
        row.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
        this.updateSomeProperties(row);
      })
      this.model = response;
      this.applyKeywordToNoteList();
    }
  }

  private onItemAddFromHeader(row: _Types.AnnotationsResponse.Row) {
    if (this.groupId === row.group && this.model?.rows) {
      const item = row as ItemModel;
      item.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
      this.model.rows.push(item);
      this.updateSomeProperties(item);
      this.applyKeywordToNoteList();
      this.changeDetectorRef.detectChanges();
      this.scrollToBotton();
    }
  }

  private scrollToBotton() {
    setTimeout(() => this.hostElement.nativeElement.scrollTop = this.hostElement.nativeElement.scrollHeight, 100);
  }

  //TODO
  private applyKeywordToNoteList() {
    this.model?.rows.forEach(r => {
      if (r.uri?.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase())
        || r.text?.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase())
        || r.tags?.some(t => t.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase()))
        || r.document?.title?.some(t => t.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase()))
      ) {
        r.disabled = false;
      } else {
        r.disabled = true;
      }
    });
  }

  //TODO
  private updateSomeProperties(row: ItemModel) {
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

    // Remove the meta directive
    let urlResultWithoutMeta = composeUrl(itemModel.uri, { metaDirectiveParameter: '' });
    itemModel.urlWithoutMeta = urlResultWithoutMeta?.url;
  }
}
export interface ItemListModel extends _Types.AnnotationsResponse.RootObject {
  rows: ItemModel[];
}