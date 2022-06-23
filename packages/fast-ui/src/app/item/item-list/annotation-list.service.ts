import { Injectable } from '@angular/core';
import { getAnnotations } from 'hypothesis-data';
import { composeUrl } from '../../fragment/fragment';
import { ItemModel, ItemType, updateSomeProperties } from '../item/item.component';
import { ItemListModel } from './item-list-model';

export class AnnotationListService {

  constructor(private key: string, private groupId: string) { }
  annotations: ItemListModel = { rows: [], total: 0 };
  keyword: string = '';
  lazyLoadedLength: number = 20;
  applyFilter(text: string) {
    this.keyword = text;
    if ((text ?? '') == '') {
      this.requestLazyLoading(this.lazyLoadedLength);
    } else {
      let updateList: ItemModel[] = [];
      this.annotations?.rows.forEach(r => {
        let old = r.display;
        if (r.uri?.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase())
          || r.text?.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase())
          || r.tags?.some(t => t.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase()))
          || r.document?.title?.some(t => t.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase()))
        ) {
          r.display = true;
        } else {
          r.display = false;
        }
        if (old != r.display) {
          updateList.push(r);
        }
      });
    }
    return this.annotations;
  }

  clearFilter() {
    this.applyFilter('');
  }

  async fetchList() {
    let response = await getAnnotations(this.key, this.groupId, 0, 200) as ItemListModel;
    while (response.rows.length < response.total) {
      let additional = await getAnnotations(this.key, this.groupId, response.rows.length, 200) as ItemListModel;
      response.rows = [...response.rows, ...additional.rows];
    }
    response.rows.forEach((row) => {
      // The type of item is decided by target > selector 
      row.itemType = (row.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
      updateSomeProperties(row);
    });
    this.annotations.rows.push(...response.rows);
    this.annotations.total = response.total;
    return this.annotations;
  }

  requestLazyLoading(length: number) {
    this.lazyLoadedLength = length;
    this.annotations.rows.forEach((row, i) => {
      if (i < length) {
        row.display = true;
      } else
        row.display = false;
    });
    return this.annotations;
  }
}
