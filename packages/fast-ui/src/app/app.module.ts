import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
// import { GroupListComponent } from './body/group-list/group-list.component';
// import { ItemComponent } from './item/item-item/item.component';
import { GroupComponent } from './body/group/group.component';
// import { ItemListComponent } from './item/item-list.component';
import { SettingComponent } from './setting/setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RenameComponent } from './header/rename/rename.component';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { ContextMenuModule } from 'primeng/contextmenu';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import {SplitButtonModule} from 'primeng/splitbutton';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    // GroupListComponent,
    // GroupComponent,
    SettingComponent,
    RenameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    ContextMenuModule,
    BreadcrumbModule,
    ConfirmPopupModule,
    SliderModule,
    InputNumberModule,
    DialogModule,
    SplitButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
