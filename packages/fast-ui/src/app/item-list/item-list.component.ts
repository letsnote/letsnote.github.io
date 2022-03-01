import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getAnnotations, updateAnnotation } from 'hypothesis-data';
import { ItemModel, ItemType } from '../item/item.component';
import { ConfigService } from '../setting/config.service';

@Component({
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss', '../style/list.scss']
})
export class ItemListComponent implements OnInit {
  model: ItemListModel | undefined;
  groupId: string | undefined;
  constructor(private config: ConfigService, route: ActivatedRoute,) {
    route.params.subscribe((param) => {
      this.groupId = param['groupId'];
      this.loadItemList();
    })
  }

  ngOnInit(): void {

  }

  onFinishEditing(model: ItemModel){
    updateAnnotation(this.config.key, model.id, {text: model.text});
  }

  private async loadItemList() {
    if (this.groupId) {
      let response = await getAnnotations(this.config.key, this.groupId) as ItemListModel;
      response.rows.forEach((row) => {
        row.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
      })
      this.model = response;
    }
  }

}
export interface ItemListModel extends _Types.AnnotationsResponse.RootObject {
  rows: ItemModel[];
}