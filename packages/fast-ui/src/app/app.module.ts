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
import { InputTextModule } from 'primeng/inputtext'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {ContextMenuModule} from 'primeng/contextmenu';
import {SliderModule} from 'primeng/slider';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {InputNumberModule} from 'primeng/inputnumber';
import {SkeletonModule} from 'primeng/skeleton';
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
    InputTextModule,
    ContextMenuModule,
    FormsModule,
    InputTextareaModule,
    BreadcrumbModule,
    ReactiveFormsModule,
    ConfirmPopupModule,
    SliderModule,
    InputNumberModule,
    SkeletonModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
