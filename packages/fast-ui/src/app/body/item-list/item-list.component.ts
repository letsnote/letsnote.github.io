import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { updateAnnotation } from 'hypothesis-data';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { HeaderService } from 'src/app/header/header.service';
import { AnnotationCreationService } from 'src/app/service/annotation-creation.service';
import { ExtensionService } from 'src/app/service/extension.service';
import { ConfigService } from 'src/app/setting/config.service';
import { ItemComponent, ItemModel } from '../item/item.component';
import { ItemListScrollPositionService } from './scroll-position.service';
import { ItemListService } from './item-list.service';

@Component({
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss', '../../style/list.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  ExclusiveChipType = ExclusiveChipType;
  model: ItemModel[] = [];
  exclusiveChip = ExclusiveChipType.UPDATED;
  editRequestId: string | undefined;
  searchKeyword: string = '';
  private subscriptions: Subscription[] = [];
  @ViewChildren('item')
  public listItems!: QueryList<ItemComponent>
  @ViewChildren('skeleton')
  skeletons!: QueryList<ElementRef<HTMLDivElement>>;
  groupId!: string;
  itemListService!: ItemListService;
  private scrollEventSubject = new Subject<void>();
  constructor(private hostElement: ElementRef
    , private config: ConfigService
    , private route: ActivatedRoute
    , private extensionService: ExtensionService
    , private changeDetectorRef: ChangeDetectorRef
    , private headerService: HeaderService, private appService: AppService, private scrollPositionService: ItemListScrollPositionService
    , private annotationService: AnnotationCreationService) {
    let s = route.params.subscribe((param) => {
      this.groupId = param['groupId'];
      this.itemListService = new ItemListService(this.config.key, this.groupId);
      this.loadItemList().then(() => {
        this.status = 'ready';
      });
    })
    let s2 = this.annotationService.noteCreatedObserverble.subscribe(async (row) => {
      if (this.groupId === row.group){    
        this.model = (await this.itemListService
          .updateListAfterCreatingAnnotation(row)).rows;
        this.changeDetectorRef.detectChanges();
        this.editRequestId = row.id;
      }
    });
    let s3 = this.headerService.searchInputControl.valueChanges.subscribe((keyword) => {
      this.searchKeyword = keyword;
      this.itemListService.applyFilter(this.searchKeyword);
    });
    let s4 = this.scrollEventSubject.pipe(debounceTime(100)).subscribe(async() => {
      await this.checkLazyLoadingCondition();
      this.scrollPositionService.savePosition(this.hostElement.nativeElement.scrollTop);
    });
    let s5 = this.scrollPositionService.positionObservable.subscribe((top) => {
      this.hostElement.nativeElement.scrollTop = top;
    });
    this.hostElement.nativeElement.onscroll = () => {
      this.scrollEventSubject.next();
    };
    this.subscriptions.push(s, s2, s3, s4, s5);
  }

  status: 'ready' | 'not_ready' = 'not_ready';

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onFinishEditing(model: ItemModel) {
    this.itemListService.updateAnnotation(model);
  }

  async onItemDeleteClick(itemModel: ItemModel) {
    this.model = (await this.itemListService
      .deleteAnnotation(itemModel.id)).rows;
    this.changeDetectorRef.detectChanges();
  }

  async onItemMoveClick(itemModel: {previous: ItemModel, groupToMove: string}) {
    let {previous, groupToMove} = itemModel;
    this.model = (await this.itemListService.deleteAnnotation(previous.id)).rows;
    await this.annotationService.copyAnnotaion({...previous, group: groupToMove});
    this.changeDetectorRef.detectChanges();
  }

  async onItemClick({ model, event }: { model: ItemModel, event: MouseEvent }) {
    if(!this.extensionService.isExtension()){
      window.open(model.uri, "_blank");
      return;
    }
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

  onToggle(type: ExclusiveChipType, toggled: boolean) {
    if (toggled) {
      this.exclusiveChip = type;
    } else {
      this.exclusiveChip = ExclusiveChipType.NONE;
    }
    this.updateSort();
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

  private async loadItemList() {
    const preload = 20;
    const initialLength: number = parseInt(this.route.snapshot.queryParams['listLength'] ?? 0);
    await this.fetchModel(initialLength + preload);
    this.route.snapshot.queryParams['fragment'] && setTimeout(() => this.navigateToItem(this.route.snapshot.queryParams['fragment']), 500);
  }

  private async fetchModel(showItemCount: number) {
    let list = await this.itemListService.fetchList();
    this.itemListService.requestLazyLoading(showItemCount);
    this.itemListService.applyFilter(this.searchKeyword);
    this.updateSort();
    this.model = list.rows;
    this.changeDetectorRef.detectChanges();
  }

  private async showMore(length: number) {
    let response = this.itemListService.requestLazyLoading(length);
    this.model = response.rows;
    this.itemListService.applyFilter(this.searchKeyword);
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

  private updateSort() {
    switch (this.exclusiveChip) {
      case ExclusiveChipType.NONE:
        this.itemListService.applySort("updated");
        break;
      case ExclusiveChipType.CREATED:
        this.itemListService.applySort("created");
        break;
      case ExclusiveChipType.UPDATED:
        this.itemListService.applySort("updated");
        break;
    }
  }
}

export enum ExclusiveChipType {
  UPDATED,
  CREATED,
  NONE
}