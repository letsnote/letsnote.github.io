import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createAnnotations, deleteAnnotation, updateAnnotation } from 'hypothesis-data';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { HeaderObserverService } from 'src/app/header/header-observer.service';
import { AnnotationService } from 'src/app/service/annotation.service';
import { ConfigService } from 'src/app/setting/config.service';
import { ItemComponent, ItemModel, ItemType, updateSomeProperties } from '../item/item.component';
import { AnnotationListService } from './annotation-list.service';
import { ItemListModel } from './item-list-model';
import { ItemListScrollService } from './item-list-scroll.service';

@Component({
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss', '../../style/list.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  ExclusiveChipType = ExclusiveChipType;
  model: ItemModel[] = [];
  groupId!: string;
  exclusiveChip = ExclusiveChipType.UPDATED;

  keyword: string = '';
  private subscriptions: Subscription[] = [];
  @ViewChildren('item')
  public listItems!: QueryList<ItemComponent>
  @ViewChildren('skeleton')
  skeletons!: QueryList<ElementRef<HTMLDivElement>>;
  annotationFetchService!: AnnotationListService;
  private scrollSubject = new Subject<void>();
  constructor(private hostElement: ElementRef
    , private config: ConfigService
    , private route: ActivatedRoute
    , private changeDetectorRef: ChangeDetectorRef
    , private headerService: HeaderObserverService, private appService: AppService, private scrollService: ItemListScrollService
    , private annotationService: AnnotationService) {
    let s = route.params.subscribe((param) => {
      this.groupId = param['groupId'];
      this.annotationFetchService = new AnnotationListService(this.config.key, this.groupId);
      this.loadItemList();
    })
    let s2 = this.annotationService.newNoteObserverble.subscribe((row) => {
      if (this.groupId === row.group)
        this.onItemAddFromHeader(row);
    });
    this.keyword = ''; //TODO
    let s3 = this.headerService.searchInputControl.valueChanges.subscribe((keyword) => {
      this.keyword = keyword;
      this.annotationFetchService.applyFilter(this.keyword);
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
      let length = ((this.model?.filter(r => r.display).length ?? 0) + candidates.length + preLoad);
      this.showMore(length);
    }
  }

  onFinishEditing(model: ItemModel) {
    updateAnnotation(this.config.key, model.id, { text: model.text });
  }

  async onItemDeleteClick(itemModel: ItemModel) {
    this.model = (await this.annotationFetchService
      .deleteAnnotation(this.config.key, itemModel.id)).rows;
    this.changeDetectorRef.detectChanges();
  }

  async onItemMoveClick(itemModel: {previous: ItemModel, groupToMove: string}) {
    let {previous, groupToMove} = itemModel;
    this.model = (await this.annotationFetchService.deleteAnnotation(this.config.key, previous.id)).rows;
    await this.annotationService.copyNewAnnotaion({...previous, group: groupToMove});
    this.changeDetectorRef.detectChanges();
  }

  private async onItemAddFromHeader(row: _Types.AnnotationsResponse.Row) {
    this.model = (await this.annotationFetchService
      .updateListAfterCreatingAnnotation(row)).rows;
    this.changeDetectorRef.detectChanges();
  }

  async onItemClick({ model, event }: { model: ItemModel, event: MouseEvent }) {
    if (model.urlWithoutMeta) {
      const currentTab = await chrome.tabs.getCurrent();
      let tab: chrome.tabs.Tab;
      if (event.ctrlKey) {
        tab = await chrome.tabs.create({ index: currentTab.index + 1, url: model.urlWithoutMeta.toString(), active: true });
        tab.id && this.appService.setInitialRoutesAfterNavigation(tab.id, this.route.snapshot.url.map(seg => seg.path), model.id, this.model?.length as number);
      } else {
        currentTab.id && chrome.tabs.sendMessage(currentTab.id, { type: 7, data: model.urlWithoutMeta.toString() });
        currentTab.id && this.appService.setInitialRoutesAfterNavigation(currentTab.id, this.route.snapshot.url.map(seg => seg.path), model.id, this.model?.length as number);
      }
    }
  }

  private async loadItemList() {
    const preload = 20;
    const initialLength: number = parseInt(this.route.snapshot.queryParams['listLength'] ?? 0);
    await this.fetchModel(initialLength + preload);
    this.route.snapshot.queryParams['fragment'] && setTimeout(() => this.navigateToItem(this.route.snapshot.queryParams['fragment']), 500);
  }

  private async fetchModel(showItemCount: number) {
    let list = await this.annotationFetchService.fetchList();
    this.annotationFetchService.requestLazyLoading(showItemCount);
    this.annotationFetchService.applyFilter(this.keyword);
    this.updateSort();
    this.model = list.rows;
    this.changeDetectorRef.detectChanges();
  }

  private async showMore(length: number) {
    let response = this.annotationFetchService.requestLazyLoading(length);
    this.model = response.rows;
    this.annotationFetchService.applyFilter(this.keyword);
    this.updateSort();
  }


  private scrollToBotton() {
    setTimeout(() => this.hostElement.nativeElement.scrollTop = this.hostElement.nativeElement.scrollHeight, 100);
  }


  private navigateToItem(id: string | null) {
    if (id) {
      const item = this.listItems.find(e => e.model?.id == id);
      item?.focus();
    }
  }

  onToggle(type: ExclusiveChipType, toggled: boolean) {
    if (toggled) {
      this.exclusiveChip = type;
    } else {
      this.exclusiveChip = ExclusiveChipType.NONE;
    }
    this.updateSort();
  }

  private updateSort() {
    switch (this.exclusiveChip) {
      case ExclusiveChipType.NONE:
        this.annotationFetchService.applySort("updated");
        break;
      case ExclusiveChipType.CREATED:
        this.annotationFetchService.applySort("created");
        break;
      case ExclusiveChipType.UPDATED:
        this.annotationFetchService.applySort("updated");
        break;
    }
  }

}

export enum ExclusiveChipType {
  UPDATED,
  CREATED,
  NONE
}