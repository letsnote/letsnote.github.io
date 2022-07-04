import { Injectable } from '@angular/core';
import { deleteAnnotation, getAnnotations } from 'hypothesis-data';
import { composeUrl } from '../../fragment/fragment';
import { ItemModel, ItemType, updateSomeProperties } from '../item/item.component';
import { ItemListModel } from './item-list-model';

export class AnnotationListService {

  constructor(private key: string, private groupId: string) { }
  annotations: ItemListModel = { rows: [], total: 0 };
  keyword: string = '';
  sort: 'updated' | 'created' = 'updated';
  lazyLoadedLength: number = 20;

  async deleteAnnotation(apiKey: string, id: string) {
    await deleteAnnotation(apiKey, id);
    this.annotations = {
      total: this.annotations.total - 1
      , rows: this.annotations.rows.filter((m) => m.id != id)
    };
    return this.annotations;
  }

  async updateListAfterCreatingAnnotation(row: _Types.AnnotationsResponse.Row) {
    let annotation = row as ItemModel;
    annotation.itemType = (annotation.target.some(t => !!t.selector)) ? ItemType.Annotation : ItemType.PageNote;
    updateSomeProperties(annotation);
    this.annotations = {
      rows: [...this.annotations.rows, annotation],
      total: this.annotations.total
    };
    this.applyFilter();
    this.applySort();
    return this.annotations;
  }

  applySort(sort?: 'updated' | 'created') {
    this.sort = sort ?? this.sort;
    this.annotations.rows.sort((a, b) => {
      if (new Date(a[this.sort]).getTime() < new Date(b[this.sort]).getTime())
        return 1;
      else
        return -1;
    });
    return this.annotations;
  }

  applyFilter(text?: string) {
    this.keyword = text ?? this.keyword;
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
    this.annotations.rows = [];
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
    this.applySort();
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
