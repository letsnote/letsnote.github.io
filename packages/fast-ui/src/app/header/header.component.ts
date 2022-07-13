import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as api from 'hypothesis-data';
import { createAnnotations, getProfile, updateGroup } from 'hypothesis-data';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { ExtensionService } from '../fragment/extension.service';
import { composeUrl } from '../fragment/fragment';
import { ConfigService } from '../setting/config.service';
import { HeaderObserverService } from './header-observer.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { rejects } from 'assert';
import { HeaderService } from './header.service';
import { AppService } from '../app.service';
import { AnnotationService } from '../service/annotation.service';
import { Location } from '@angular/common';
import { GroupModel } from '../group-model';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  menuItems: MenuItem[] = [];
  searchKeyword: string = '';
  breadcrumbItems: MenuItem[] = [];
  baseBreadcrumbItems: MenuItem[] = [
    {
      label: '그룹',
      command: () => {
        this.router.navigate(['groups'], { replaceUrl: true });
      },
    },
  ];
  group: GroupModel | undefined;
  currentRoute: CurrentRoute = CurrentRoute.Home;
  lastGroupSearchKeyword: string = '';
  noteSearchSubscription: Subscription | undefined;
  groupSearchSubscription: Subscription | undefined;

  renameFormGroup = this.formBuilder.group({
    groupId: [''],
    oldValue: [''],
    newValue: ['']
  });

  items = [
    {
      label: '새 노트', icon: 'pi pi-plus', command: () => {
        if (!this.group)
          return;
        const groupId = this.group.id;
        this.onNewNote(groupId, "EMPTY_SOURCE");
      }
    }
  ];

  displayRenameDialog = false;

  constructor(private location: Location, public config: ConfigService, private router: Router, private extensionService: ExtensionService, public observer: HeaderObserverService,
    private formBuilder: FormBuilder,
    private headerService: HeaderService,
    private annotationService: AnnotationService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.group = undefined;
        const urlWithoutHashFragment = event.urlAfterRedirects.split('#')[0];
        if (urlWithoutHashFragment.includes('groups')) {
          const urlParts = urlWithoutHashFragment.split('/');
          if (urlParts.length >= 3) {
            this.currentRoute = CurrentRoute.Group;
            const groupId = urlParts[2];
            api.getGroups(config.key).then((groups) => {
              this.group = groups.find((g) => g.id === groupId.split('?')[0]);
              this.breadcrumbItems = [
                ...this.baseBreadcrumbItems, {
                  label: `${this.group?.name}`,
                  id: `${this.group?.id}`,
                  command: () => {
                    if (this.group)
                      this.requestToRenameGroup(this.group?.id, this.group?.name, this.group?.name);
                  }
                },
              ];
            });
            this.observer.searchInputControl.setValue(''); //TODO
          }else {
            this.currentRoute = CurrentRoute.Home;
            this.breadcrumbItems = [...this.baseBreadcrumbItems];
            this.observer.searchInputControl.setValue(this.lastGroupSearchKeyword);
          }
        } else if (urlWithoutHashFragment.includes('setting')) {
          this.currentRoute = CurrentRoute.Setting;
          this.breadcrumbItems = [
            ...this.baseBreadcrumbItems,
            { label: `설정` },
          ];
        } 
      }
    });

    this.observer.searchInputControl.valueChanges.subscribe((value) => {
      if (this.currentRoute === CurrentRoute.Home)
        this.lastGroupSearchKeyword = value;
    });

    extensionService.requestFromContextMenu.subscribe(({ groupId }) => {
      this.onNewNote(groupId);
    });

    this.headerService.renameObservable.subscribe((param: { groupId: string, oldValue: string, newValue?: string }) => {
      this.requestToRenameGroup(param.groupId, param.oldValue, param.newValue);
    });

  }

  close() {
    console.debug('close');
    this.onClose.emit();
  }

  @Output('close')
  onClose: EventEmitter<void> = new EventEmitter();
  @Output('openKey')
  onOpenKey: EventEmitter<void> = new EventEmitter();
  @Output('newGroupClick')
  onNewGroupClick: EventEmitter<void> = new EventEmitter();
  @Output('newPageNoteClick')
  onNewPageNoteClick: EventEmitter<void> = new EventEmitter();
  async onNewGroup(tryCount: number = 0) {
    const randomSeq = parseInt('' + Math.random() * 1000);
    if (tryCount > 5) {
      console.error(`Can't create a new group`);
      return;
    }
    try {
      const group = await api.createGroup(this.config.key, {
        name: `그룹${randomSeq}`,
        description: '',
      });
      this.router.navigate(['groups', `${group.id}`], { replaceUrl: true });
    } catch (e) {
      console.info(`Try to create a group again with another sequence number.`);
      this.onNewGroup(++tryCount);
    }
  }

  /**
   * TODO: It should not be here
   * @param groupId 
   */
  async onNewNote(groupId: string, urlParameter?: string) {
    return this.annotationService.createNewAnnotation(
      groupId, urlParameter);
  }

  ngOnInit(): void {
    this.menuItems = [
      {
        label: '설정',
        items: [
          {
            label: 'API키 입력 및 설정',
            icon: 'pi pi-key',
            command: () => {
              this.onOpenKey.emit();
              this.router.navigate(['setting'], { replaceUrl: true });
            },
          },
        ],
      },
    ];
  }

  requestToRenameGroup(groupId: string, oldValue: string, newValue?: string) {
    this.renameFormGroup.patchValue({
      groupId,
      oldValue,
      newValue: newValue ?? oldValue
    });
    this.displayRenameDialog = true;

  }

  onRenameSave() {
    const id = this.renameFormGroup.get("groupId")?.value;
    const newName = this.renameFormGroup.get("newValue")?.value;
    updateGroup(this.config.key, id, { name: newName }).then(resolve => {
      if (this.group) {
        this.group.name = newName;
        this.breadcrumbItems = this.breadcrumbItems.map(b => {
          if (b.id == id) {
            b.label = newName;
          }
          return b;
        });
      }
      this.observer.pushGroupNameUpdate(id, newName);
      console.debug("그룹명이 업데이트 되었습니다.");
      this.displayRenameDialog = false;
    }, () => {
      console.debug("그룹명 업데이트에 실패하였습니다.");
      this.displayRenameDialog = false;
    });
  }
}

enum CurrentRoute {
  Home,
  Group,
  Setting,
}
