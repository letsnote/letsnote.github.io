import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { deleteAnnotation, getAnnotations, updateAnnotation } from 'hypothesis-data';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { composeUrl } from '../fragment/fragment';
import { HeaderObserverService } from '../header/header-observer.service';
import { ItemComponent, ItemModel, ItemType, updateSomeProperties } from '../item/item.component';
import { ConfigService } from '../setting/config.service';
import { AnnotationFetchService } from './annotation-fetch.service';
import { ItemListModel } from './item-list-model';
import { ItemListScrollService } from './item-list-scroll.service';

@Component({
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss', '../style/list.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  model: ItemListModel | undefined;
  groupId!: string;

  keyword: string = '';
  private subscriptions: Subscription[] = [];
  @ViewChildren('item')
  public listItems!: QueryList<ItemComponent>
  @ViewChildren('skeleton')
  skeletons!: QueryList<ElementRef<HTMLDivElement>>;
  annotationFetchService!: AnnotationFetchService;
  private scrollSubject = new Subject<void>();
  constructor(private hostElement: ElementRef, private config: ConfigService, private route: ActivatedRoute, private headerObserver: HeaderObserverService, private changeDetectorRef: ChangeDetectorRef
    , private headerService: HeaderObserverService, private appService: AppService, private scrollService: ItemListScrollService) {
    let s = route.params.subscribe((param) => {
      this.groupId = param['groupId'];
      this.annotationFetchService = new AnnotationFetchService(this.config.key, this.groupId);
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
    this.hostElement.nativeElement.onscroll = () => {
      this.scrollSubject.next();
    };
    let s4 = this.scrollSubject.pipe(debounceTime(100)).subscribe(() => {
      this.checkLazyLoadingCondition();
      this.scrollService.savePosition(this.hostElement.nativeElement.scrollTop);
    });
    let s5 = this.scrollService.positionObservable.subscribe((top) => {
      this.hostElement.nativeElement.scrollTop = top;
    });
    this.subscriptions.push(s, s2, s3, s4, s5);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private async checkLazyLoadingCondition() {
    let candidates = this.skeletons.filter((item, i, arr) => {
      const rect: DOMRect = item.nativeElement.getBoundingClientRect();
      if (window.innerHeight > rect.bottom) {
        return true;
      }
      return false;
    });
    if (candidates.length != 0) {
      const preLoad = 10;
      let length = ((this.model?.rows.length ?? 0) + candidates.length + preLoad);
      this.updateModel(length);
    }
  }

  onFinishEditing(model: ItemModel) {
    updateAnnotation(this.config.key, model.id, { text: model.text });
  }

  async onItemDeleteClick(itemModel: ItemModel) {
    if (this.model) {
      await deleteAnnotation(this.config.key, itemModel.id);
      this.model = { ...this.model, rows: this.model?.rows.filter((m) => m.id != itemModel.id) };
      this.model.total--;
      this.changeDetectorRef.detectChanges(); // TODO: is it right?
    }
  }

  async onItemClick({ model, event }: { model: ItemModel, event: MouseEvent }) {
    if (model.urlWithoutMeta) {
      const currentTab = await chrome.tabs.getCurrent();
      let tab: chrome.tabs.Tab;
      if (event.ctrlKey) {
        tab = await chrome.tabs.create({ index: currentTab.index + 1, url: model.urlWithoutMeta.toString(), active: true });
        tab.id && this.appService.setInitialRoutesAfterNavigation(tab.id, this.route.snapshot.url.map(seg => seg.path), model.id, this.model?.rows.length as number);
      } else {
        currentTab.id && chrome.tabs.sendMessage(currentTab.id, { type: 7, data: model.urlWithoutMeta.toString() });
        currentTab.id && this.appService.setInitialRoutesAfterNavigation(currentTab.id, this.route.snapshot.url.map(seg => seg.path), model.id, this.model?.rows.length as number);
      }
    }
  }

  private async loadItemList() {
    const preload = 20;
    const initialLength: number = parseInt(this.route.snapshot.queryParams['listLength'] ?? 0);
    await this.updateModel(initialLength + preload);
    this.route.snapshot.queryParams['fragment'] && setTimeout(() => this.navigateToItem(this.route.snapshot.queryParams['fragment']), 500);
  }

  private async updateModel(length: number) {
    let response = await this.annotationFetchService.requestAnnotations(length);
    this.model = response;
    this.applyKeywordToNoteList();
  }

  private onItemAddFromHeader(row: _Types.AnnotationsResponse.Row) {
    if (this.groupId === row.group && this.model?.rows) {
      const item = row as ItemModel;
      item.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
      this.model.total++;
      this.model.rows.push(item);
      updateSomeProperties(item);
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

  private navigateToItem(id: string | null) {
    if (id) {
      const item = this.listItems.find(e => e.model?.id == id);
      item?.focus();
    }
  }

}