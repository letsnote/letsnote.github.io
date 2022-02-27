import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import {ButtonModule} from 'primeng/button';
import { GroupListComponent } from './group-list/group-list.component';
import { ItemComponent } from './item/item.component';
import { GroupComponent } from './group/group.component';
import {MenuModule} from 'primeng/menu';
import { ItemListComponent } from './item-list/item-list.component';
import { SettingComponent } from './setting/setting.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GroupListComponent,
    ItemComponent,
    GroupComponent,
    ItemListComponent,
    SettingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ButtonModule,
    MenuModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
