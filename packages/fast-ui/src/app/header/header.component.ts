import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import * as api from 'hypothesis-data';
import { updateGroup } from 'hypothesis-data';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GroupModel } from '../group-model';
import { AnnotationCreationService } from '../service/annotation-creation.service';
import { ContextMenuService as FragmentExtensionService } from '../service/context-menu.service';
import { ExtensionService } from '../service/extension.service';
import { ConfigService } from '../setting/config.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  breadcrumbItems: MenuItem[] = [];
  currentGroup: GroupModel | undefined;
  currentRoute: CurrentRoute = CurrentRoute.Home;
  noteSearchSubscription: Subscription | undefined;
  groupSearchSubscription: Subscription | undefined;
  subscriptions: Subscription[] = [];

  renameFormGroup = this.formBuilder.group({
    groupId: ['', Validators.required],
    oldValue: ['', Validators.required],
    newValue: ['', Validators.required]
  });

  splitButtonItems = [{
    label: '새 노트', icon: 'pi pi-plus', command: () => {
      if (!this.currentGroup)
        return;
      this.annotationCreationService.createNewAnnotation(this.currentGroup.id);
    }
  }]

  displayRenameDialog = false;

  private readonly baseBreadcrumbItems: MenuItem[] = [
    {
      label: '그룹',
      command: () => {
        if(this.extensionService.isExtension())
          this.router.navigate(['groups'], { replaceUrl: true });
        else
          window.history.back();
      },
    },
  ];

  constructor(public config: ConfigService, private router: Router,
    public extensionService: ExtensionService, private formBuilder: FormBuilder,
    public headerService: HeaderService,
    public annotationCreationService: AnnotationCreationService) {
    let s3 = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentGroup = undefined;
        const urlWithoutHashFragment = event.urlAfterRedirects.split('#')[0];
        if (urlWithoutHashFragment.includes('groups')) {
          const urlParts = urlWithoutHashFragment.split('/');
          if (urlParts.length >= 3) {
            this.currentRoute = CurrentRoute.Group;
            const groupId = urlParts[2];
            api.getGroups(config.key).then((groups) => {
              this.currentGroup = groups.find((g) => g.id === groupId.split('?')[0]);
              this.breadcrumbItems = [
                ...this.baseBreadcrumbItems, {
                  label: `${this.currentGroup?.name}`,
                  id: `${this.currentGroup?.id}`,
                  command: () => {
                    if (this.currentGroup) {
                      if (this.extensionService.isExtension())
                        this.updateRenameForm(this.currentGroup?.id, this.currentGroup?.name, this.currentGroup?.name);
                      else
                        window.open(`https://hypothes.is/groups/${this.currentGroup.id}/edit`, "_blank");
                    }
                  }
                },
              ];
            });
            this.headerService.searchInputControl.setValue(''); //TODO
          } else {
            this.currentRoute = CurrentRoute.Home;
            this.breadcrumbItems = [...this.baseBreadcrumbItems];
            this.headerService.searchInputControl.setValue(this.headerService.lastGroupSearchKeyword);
          }
        } else if (urlWithoutHashFragment.includes('setting')) {
          this.currentRoute = CurrentRoute.Setting;
          this.breadcrumbItems = [
            ...this.baseBreadcrumbItems,
            { label: `설정` },
          ];
        } else if (urlWithoutHashFragment.includes('share')) {
          this.currentRoute = CurrentRoute.Share;
          this.breadcrumbItems = [
            ...this.baseBreadcrumbItems,
            { label: `공유` },
          ];
        }
      }
    });

    let s1 = this.headerService.searchInputControl.valueChanges.subscribe((value) => {
      if (this.currentRoute === CurrentRoute.Home)
        this.headerService.lastGroupSearchKeyword = value;
    });

    let s2 = this.headerService.renameGroupRequestedObservable.subscribe((param: { groupId: string, oldValue: string, newValue?: string }) => {
      this.updateRenameForm(param.groupId, param.oldValue, param.newValue);
    });
    this.subscriptions.push(s1, s2, s3);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  close() {
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
      console.info(`Can't create a new group`);
      return;
    }
    try {
      const group = await api.createGroup(this.config.key, {
        name: `그룹${randomSeq}`,
        description: '',
      });
      this.router.navigate(['groups', `${group.id}`], { replaceUrl: this.extensionService.isExtension() ? true : false });
    } catch (e) {
      console.info(`Try to create a group again with another sequence number.`);
      this.onNewGroup(++tryCount);
    }
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
              this.router.navigate(['setting'], { replaceUrl: this.extensionService.isExtension() ? true : false });
            },
          },
        ],
      },
    ];
  }

  private updateRenameForm(groupId: string, oldValue: string, newValue?: string) {
    this.renameFormGroup.patchValue({
      groupId,
      oldValue,
      newValue: newValue ?? oldValue
    });
    this.displayRenameDialog = true;
  }

  onRenameSave() {
    if (this.renameFormGroup.invalid) {
      console.info("그룹명이 비어있습니다.");
      return;
    }
    const id = this.renameFormGroup.get("groupId")?.value;
    const newName = this.renameFormGroup.get("newValue")?.value;
    updateGroup(this.config.key, id, { name: newName }).then(resolve => {
      if (this.currentGroup) {
        this.currentGroup.name = newName;
        this.breadcrumbItems = this.breadcrumbItems.map(b => {
          if (b.id == id) {
            b.label = newName;
          }
          return b;
        });
      }
      this.headerService.pushGroupNameUpdate(id, newName);
      console.info("그룹명이 업데이트 되었습니다.");
      this.displayRenameDialog = false;
    }, (rejected) => {
      console.info("그룹명 업데이트에 실패하였습니다.");
      this.displayRenameDialog = false;
    });
  }

  refresh(){
    window.location.reload();
  }
}

enum CurrentRoute {
  Home,
  Group,
  Setting,
  Share,
}
