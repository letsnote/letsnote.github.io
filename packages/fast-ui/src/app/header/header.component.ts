import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import * as api from 'hypothesis-data';
import { createAnnotations, getProfile } from 'hypothesis-data';
import { MenuItem } from 'primeng/api';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { ExtensionService } from '../fragment/extension.service';
import { composeUrl } from '../fragment/fragment';
import { GroupModel } from '../group/group.component';
import { ConfigService } from '../setting/config.service';

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
        this.router.navigate(['']);
      },
    },
  ];
  group: GroupModel | undefined;
  currentRoute: CurrentRoute = CurrentRoute.Home;

  constructor(public config: ConfigService, private router: Router, private extensionService: ExtensionService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.group = undefined;
        if (event.urlAfterRedirects.includes('groups')) {
          this.currentRoute = CurrentRoute.Group;
          const groupId = event.urlAfterRedirects.split('/')[2];
          api.getGroups(config.key).then((groups) => {
            this.group = groups.find((g) => g.id === groupId);
            this.breadcrumbItems = [
              ...this.baseBreadcrumbItems,
              {
                label: `${this.group?.name}`,
                command: (event) => {
                  // if (event?.originalEvent?.target) {
                  //   const span = event.originalEvent.target as HTMLSpanElement;
                  //   span.contentEditable = 'true';
                  //   span.style.padding = '0.25em 0.5em 0.25em 0.5em';
                  //   span.focus();
                  //   span.onblur = () => {
                  //     span.style.padding = '';
                  //     span.contentEditable = 'false';
                  //     api.updateGroup(this.config.key, groupId, {
                  //       name: span.innerText,
                  //     })
                  //     // TODO: update group name on the remote.
                  //   };
                  // }
                },
              },
            ];
          });
        } else if (event.urlAfterRedirects.includes('setting')) {
          this.currentRoute = CurrentRoute.Setting;
          this.breadcrumbItems = [
            ...this.baseBreadcrumbItems,
            { label: `설정` },
          ];
        } else {
          this.currentRoute = CurrentRoute.Home;
          this.breadcrumbItems = [...this.baseBreadcrumbItems];
        }
      }
    });

    extensionService.requestFromContextMenu.subscribe(({groupId}) => {
      this.onNewNote(groupId);
    })
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
      this.router.navigate(['groups', `${group.id}`]);
    } catch (e) {
      console.info(`Try to create a group again with another sequence number.`);
      this.onNewGroup(++tryCount);
    }
  }

  async onNewNote(groupId?: string) {
    const profile = await getProfile(this.config.key);
    const group = groupId ?? this.group?.id as string;
    chrome?.tabs?.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id && tab.title && tab.url) {
        const tabId = tab.id;
        const title = tab.title;
        const url = tab.url;
        const favicon = tab.favIconUrl;
        const fragment = await new Promise<
          | {
              fullUrl: string;
              fragment: TextFragment;
              textDirectiveParameters: string;
              selectedText: string;
            }
          | undefined
        >((resolve) => {
          chrome.tabs.sendMessage(tabId, { type: 1 }, (res) => {
            resolve(res);
          });
        });
        let meta = {};
        if (favicon) meta = { ...meta, favicon };
        const newUrl = composeUrl(url, {
          metaDirectiveParameter: JSON.stringify(meta),
          textDirectiveParameter: fragment?.textDirectiveParameters,
        });
        // if (uri.includes('#')) {
        //   uriWithMeta = `${uri}:~:meta=${JSON.stringify(meta)}`;
        // } else {
        //   uriWithMeta = `${uri}#:~:meta=${JSON.stringify(meta)}`;
        // }
        createAnnotations(this.config.key, {
          group,
          tags: [],
          text: '',
          user: profile.userid,
          document: { title: [title] },
          uri: newUrl.url.toString(),
          target: [],
          references: [],
          permissions: {
            read: [],
            update: [profile.userid],
            delete: [profile.userid],
          },
        });
      }
    });
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
              this.router.navigate(['setting']);
            },
          },
        ],
      },
    ];
  }
}

enum CurrentRoute {
  Home,
  Group,
  Setting,
}
