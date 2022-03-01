import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { updateAnnotation } from 'hypothesis-data';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit, OnChanges {

  constructor() { }
  noteBoxMode: NoteBoxMode = NoteBoxMode.View;
  autoResize = true;
  @Input()
  model: ItemModel | undefined;
  url: URL | undefined;
  @Output()
  itemClick = new EventEmitter();
  @Output('finishEditing')
  finishEditingEmitter = new EventEmitter();
  @ViewChild('textarea')
  textarea: ElementRef | undefined;

  onLinkClick(){
    if(this.url){
      this.itemClick.emit(this.model);
      window.open(`${this.url.toString()}`);
    }
  }

  ngOnInit(): void { }

  onTryEdit(){
    this.noteBoxMode = NoteBoxMode.Edit;
    setTimeout(() => {
      this.textarea?.nativeElement.focus();
    }, 100)
  }

  onStopEditing(){
    this.finishEditingEmitter.emit(this.model);
    this.noteBoxMode = NoteBoxMode.View;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["model"]) {
      const model = (changes["model"].currentValue as ItemModel);
      try {
        this.url = new URL(model.uri);
      } catch (e) { 
        // undefined or empty string or "EMPTY_SOURCE"
      }
    }
  }
}

export interface ItemModel extends _Types.AnnotationsResponse.Row {
  itemType: ItemType
}

export enum ItemType{
  Annotation,
  PageNote
}

enum NoteBoxMode{
  Edit,
  View
}