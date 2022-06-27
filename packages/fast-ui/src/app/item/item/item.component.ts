import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { composeUrl } from '../../fragment/fragment';
import { ItemListScrollService } from '../item-list/item-list-scroll.service';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class ItemComponent implements OnInit, OnChanges {
  constructor(
    private hostElementRef: ElementRef,
    private confirmationService: ConfirmationService,
    private changeDetector: ChangeDetectorRef,
    private scrollService: ItemListScrollService
  ) { }
  NoteBoxMode = NoteBoxMode;
  noteBoxMode: NoteBoxMode = NoteBoxMode.View;
  autoResize = true;
  @Input()
  model: ItemModel | undefined;
  @Output()
  itemClick = new EventEmitter<{event: MouseEvent, model: ItemModel}>();
  @Output('finishEditing')
  finishEditingEmitter = new EventEmitter();
  @ViewChild('textarea')
  textarea: ElementRef | undefined;
  @Output('itemDeleteClick')
  itemDeleteEmitter = new EventEmitter();

  async onLinkClick(click: MouseEvent) {
    click.preventDefault();
    if (this.model) {
      this.itemClick.emit({model: this.model, event: click});
    }
  }

  ngOnInit(): void { }

  onTryEdit() {
    this.noteBoxMode = NoteBoxMode.Edit;
    this.changeDetector.markForCheck();
    setTimeout(() => {
      this.textarea?.nativeElement.focus();
      this.scrollService.restorePosition();
    }, 0);
  }

  onStopEditing() {
    this.finishEditingEmitter.emit(this.model);
    if (this.model) this.updateContextMenu(this.model);
    this.noteBoxMode = NoteBoxMode.View;
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.scrollService.restorePosition();
    }, 0);
  }

  baseContextMenuItems: MenuItem[] = [
    {
      label: '항목 삭제',
      command: (event) => {
        this.onItemDeleteClick(event);
      },
    },
  ];

  contextMenuItems: MenuItem[] = [];

  onItemDeleteClick(event: any) {
    const hostElement = this.hostElementRef?.nativeElement;
    if (!hostElement) return;
    (event.originalEvent as Event).stopPropagation();
    this.confirmationService.confirm({
      target: hostElement,
      message: '정말로 삭제하시겠습니까?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.itemDeleteEmitter.emit(this.model);
      },
      reject: () => {
        //reject action
      },
    });
    this.changeDetector.detectChanges();
  }

  focus(){
    this.hostElementRef.nativeElement?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      const model = changes['model'].currentValue as ItemModel;
      this.updateContextMenu(model);
    }
  }

  update(){
    this.changeDetector.markForCheck();
  }

  updateContextMenu(model: ItemModel) {
    this.contextMenuItems = this.baseContextMenuItems;
    this.contextMenuItems = [
      ...this.contextMenuItems,
      {
        label: model.text === '' ? '메모 추가' : '메모 편집',
        command: (event) => {
          this.onTryEdit();
        },
      },
    ];
  }
}

export interface ItemModel extends _Types.AnnotationsResponse.Row {
  itemType: ItemType;
  // disabled?: boolean;
  display: boolean;
  favicon?: string;
  textFragment?: string;
  urlWithoutMeta?: URL;
}

export enum ItemType {
  Annotation,
  PageNote,
}

enum NoteBoxMode {
  Edit,
  View,
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