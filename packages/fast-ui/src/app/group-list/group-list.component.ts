import { Component, Input, OnInit } from '@angular/core';
import { GroupModel } from '../group/group.component';
import * as api from 'hypothesis-data'
import { Router } from '@angular/router';
import { ConfigService } from '../setting/config.service';
import { MenuItem } from 'primeng/api';
import { deleteGroup } from 'hypothesis-data';
import { ConfirmationService } from 'primeng/api';

@Component({
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss', '../style/list.scss']
})
export class GroupListComponent implements OnInit {

  model: GroupListModel = { groups: [] };
  constructor(private config: ConfigService, private router: Router) { }
  cacheKey = "item_count_cache_key"


  ngOnInit(): void {
    this.loadGroups();
  }

  private async loadGroups() {
    const groups = await api.getGroups(this.config.key);
    this.model = { groups: groups.map(g => ({ ...g })) };

    const cacheString = localStorage.getItem(this.cacheKey);
    const cache = cacheString ? JSON.parse(cacheString) as ItemCountCache : null;
    if (!cache || // Invalidate ten minutes later
      30 < (Math.abs(new Date(cache.date).getTime() - Date.now()) / (1000 * 60))){
      for (let group of this.model.groups) {
        await this.updateItemCount(group);
      }
      const itemCountCache: ItemCountCache = {
        date: new Date()
        , data: this.model.groups.reduce((p, c) => {
          return {...p, [c.id]: c.itemCount}
        },{})
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(itemCountCache));
    }else{
      for (let group of this.model.groups) {
        group.itemCount = cache?.data[group.id] ?? await this.updateItemCount(group);
      }
    }
  }

  private async updateItemCount(groupModel: GroupModel) {
    const annotations = await api.getAnnotations(this.config.key, groupModel.id, 0);
    groupModel.itemCount = annotations.total;
    return annotations.total;
  }

  onGroupClick(model: GroupModel) {
    this.router.navigate(['groups', model.id]);
  }
  async onGroupDeleteClick(model: GroupModel) {
    await deleteGroup(this.config.key, model.id);
    this.model.groups = this.model.groups.filter(m => m.id != model.id);
  }
}

export interface GroupListModel {
  groups: GroupModel[];
}

interface ItemCountCache {
  date: Date,
  data: { [id: string]: number };
}