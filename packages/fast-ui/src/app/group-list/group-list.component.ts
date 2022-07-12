import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { GroupModel } from '../group/group.component';
import * as api from 'hypothesis-data'
import { Router } from '@angular/router';
import { ConfigService } from '../setting/config.service';
import { deleteGroup } from 'hypothesis-data';
import { ExtensionService } from '../fragment/extension.service';
import { HeaderObserverService } from '../header/header-observer.service';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { GroupListScrollService } from './group-list-scroll.service';

@Component({
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss', '../style/list.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {

  model: GroupListModel = { groups: [] };
  keyword: string = '';
  enabled = false;
  subscriptions: Subscription[] = [];
  constructor(private hostElement: ElementRef, private config: ConfigService, private router: Router, private extensionService: ExtensionService, private headerService: HeaderObserverService
    , private appService: AppService
    ,private changeDetectRef: ChangeDetectorRef,
    private groupListScrollService: GroupListScrollService) {
    this.keyword = this.headerService.searchInputControl.value; // TODO
    let s = this.headerService.searchInputControl.valueChanges.subscribe((keyword) => {
      this.keyword = keyword;
      this.applyKeywordToGroupList();
    });
    let s1 = this.groupListScrollService.scrollObservable.subscribe((lastScrollPosition) => {
      this.updateLastScrollPosition(lastScrollPosition);
    });
    this.observeGroupListScroll();
    this.subscriptions.push(s, s1);
  }

  ngOnInit() {
    this.loadGroups();
    //A ngOnInit method that is invoked immediately after the default change detector has checked the directive's data-bound properties for the first time
    let s1 = this.appService.onChangeComponentRendering.subscribe((enabled) => {
      this.enabled = enabled;
      this.changeDetectRef.detectChanges();
      console.debug(`lastScrollTop: ${this.lastScrollPosition}, enabled: ${enabled}`);
      if(enabled){
        this.hostElement.nativeElement.scrollTop = this.lastScrollPosition;
        this.observeGroupListScroll();
      }else
        this.unobserveGroupListScroll();
    });
    this.subscriptions.push(s1);
  }

  lastScrollPosition: number = 0;

  private updateLastScrollPosition(position: number){
    this.lastScrollPosition = position;
  }

  private observeGroupListScroll(){
    this.hostElement.nativeElement.onscroll = () => {
      this.groupListScrollService.updateScroll(this.hostElement.nativeElement.scrollTop);
    };
  }

  private unobserveGroupListScroll(){
    this.hostElement.nativeElement.onscroll = () => {};
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private async getItemCount(groupModel: GroupModel) {
    interface ItemCountObject {
      itemCount: number;
      date: Date;
    }
    let countCacheString = localStorage.getItem(groupModel.id);
    if (countCacheString && Math.abs((new Date(JSON.parse(countCacheString).date).getTime() - Date.now()) / (1000 * 60)) > 30) {
      countCacheString = null;
    }
    let itemCountObject: ItemCountObject | null = countCacheString ? JSON.parse(countCacheString) : null;
    if (!itemCountObject) {
      // Get the count of items from Hypothesis 
      const annotations = await api.getAnnotations(this.config.key, groupModel.id, 0, 0);
      itemCountObject = { itemCount: annotations.total, date: new Date() };
    }

    localStorage.setItem(groupModel.id, JSON.stringify(itemCountObject));
    return itemCountObject.itemCount;
  }

  private async loadGroups() {
    const groups = await api.getGroups(this.config.key);
    this.model = { groups: groups.map(g => ({ ...g })) };
    for (let group of this.model.groups) {
      group.itemCount = await this.getItemCount(group);
    }
    this.applyKeywordToGroupList();
    this.onGroupListUpdate();
    this.changeDetectRef.detectChanges();
    this.hostElement.nativeElement.scrollTop = this.lastScrollPosition;
  }

  onGroupClick(model: GroupModel) {
    this.router.navigate(['groups', model.id], { replaceUrl: true });
  }

  async onGroupDeleteClick(model: GroupModel) {
    await deleteGroup(this.config.key, model.id);
    this.model.groups = this.model.groups.filter(m => m.id != model.id);
    this.applyKeywordToGroupList();
    this.onGroupListUpdate();
  }

  private applyKeywordToGroupList() {
    this.model.groups.forEach(g => {
      if (g.name.toLocaleLowerCase().includes(this.keyword.toLocaleLowerCase())) {
        g.disabled = false;
      } else {
        g.disabled = true;
      }
    });
  }

  onGroupListUpdate() {
    //TODO
    this.extensionService.updateContextMenu(this.model);
  }
}

export interface GroupListModel {
  groups: GroupModel[];
}