import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { updateAnnotation } from 'hypothesis-data';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { composeUrl } from '../fragment/fragment';

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
    private changeDetector: ChangeDetectorRef
  ) { }
  noteBoxMode: NoteBoxMode = NoteBoxMode.View;
  autoResize = true;
  // url: URL | undefined;
  // image: string | undefined;
  // textFragment: string | undefined;
  @Input()
  model: ItemModel | undefined;
  @Output()
  itemClick = new EventEmitter();
  @Output('finishEditing')
  finishEditingEmitter = new EventEmitter();
  @ViewChild('textarea')
  textarea: ElementRef | undefined;
  @Output('itemDeleteClick')
  itemDeleteEmitter = new EventEmitter();
  @ViewChild('anchor')
  anchorElement: ElementRef | undefined;
  async onLinkClick() {
    if (this.model?.urlWithoutMeta) {
      this.itemClick.emit(this.model);
      this.anchorElement?.nativeElement.click();
    }
  }

  ngOnInit(): void { }

  onTryEdit() {
    this.noteBoxMode = NoteBoxMode.Edit;
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.textarea?.nativeElement.focus();
    }, 100);
  }

  onStopEditing() {
    this.finishEditingEmitter.emit(this.model);
    if (this.model) this.updateContextMenu(this.model);
    this.noteBoxMode = NoteBoxMode.View;
    this.changeDetector.detectChanges();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      const model = changes['model'].currentValue as ItemModel;
      this.updateContextMenu(model);
    }
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
  disabled?: boolean;
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
