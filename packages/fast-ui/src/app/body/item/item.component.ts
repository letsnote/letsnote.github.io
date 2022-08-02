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
  ViewChild
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getGroups } from 'hypothesis-data';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfigService } from 'src/app/setting/config.service';
import { ItemListScrollPositionService } from '../item-list/scroll-position.service';

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
    private scrollService: ItemListScrollPositionService,
    private configService: ConfigService
  ) { }
  NoteBoxMode = NoteBoxMode;
  noteBoxMode: NoteBoxMode = NoteBoxMode.View;
  ItemType = ItemType;
  autoResize = true;
  @Input()
  model: ItemModel | undefined;
  @Input()
  editRequest: 'request' | 'complete' | 'ready' = 'ready';
  @Output()
  itemClick = new EventEmitter<{event: MouseEvent, model: ItemModel}>();
  @Output('finishEditing')
  finishEditingEmitter = new EventEmitter();
  @ViewChild('textarea')
  textarea: ElementRef | undefined;
  @Output('itemDeleteClick')
  itemDeleteEmitter = new EventEmitter();
  @Output('itemMoveClick')
  itemMoveEmitter = new EventEmitter<{previous: ItemModel, groupToMove: string}>();

  async onLinkClick(click: MouseEvent) {
    click.preventDefault();
    if (this.model) {
      this.itemClick.emit({model: this.model, event: click});
    }
  }

  ngOnInit(): void { }

  onTryEdit() {
    this.noteBoxMode = NoteBoxMode.Edit;
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.textarea?.nativeElement.focus();
      this.scrollService.restorePosition();
    }, 100);
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
        this.onItemDeleteMenuClick(event);
      },
    },
    {
      label: '그룹 이동',
      command: async (event) => {
        this.onItemMoveMenuClick(event);
      },
    }
    
  ];

  contextMenuItems: MenuItem[] = [];

  onItemDeleteMenuClick(event: any) {
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

  async onItemMoveMenuClick(event: any){
    this.displayMoveGroupDialog = true;
    this.moveGroupDialogStatus = 'loading';
    this.groupList = [];
    try{
      let groups = await getGroups(this.configService.key);
      this.groupList = groups.map(g => ({id: g.id, name: g.name}));
      this.selectedGroupToMoveForm.setValue(this.model?.group);
    }catch(e){
      this.moveGroupDialogStatus = 'fail';
    }finally{
      this.moveGroupDialogStatus = 'loaded';
    }
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
    if (changes['editRequest']) {
      if(this.editRequest == 'request')
        this.onTryEdit();
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

  async onMoveGroupCkick(){
    this.displayMoveGroupDialog = false;
    if(this.model
        && this.selectedGroupToMoveForm.valid
        && this.model.group != this.selectedGroupToMoveForm.value){
      this.itemMoveEmitter.emit({previous: this.model
        , groupToMove: this.selectedGroupToMoveForm.value});
    }
    this.changeDetector.detectChanges();
  }

  onGroupMoveDialogClose(){
    this.displayMoveGroupDialog = false;
    this.changeDetector.detectChanges();
  }

  selectedGroupToMoveForm = new FormControl(undefined, [Validators.required]);
  groupList: {id: string, name: string}[] = [];
  displayMoveGroupDialog = false;
  moveGroupDialogStatus: 'loading' | 'fail' | 'loaded' = 'loaded' ;
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
  EmptySource
}

enum NoteBoxMode {
  Edit,
  View,
}
