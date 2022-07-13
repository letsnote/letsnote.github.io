import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemRoutingModule } from './item-routing.module';
import { ItemAppComponent } from './item.component';
import { ItemListComponent } from './item-list/item-list.component';

import { MarkdownModule } from 'ngx-markdown';
import {ButtonModule} from 'primeng/button';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ContextMenuModule} from 'primeng/contextmenu';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {SkeletonModule} from 'primeng/skeleton';
import {DropdownModule} from 'primeng/dropdown';
import {DialogModule} from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemComponent } from './item/item.component';
import { CustomChipModule } from '../custom-chip/custom-chip.module';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupComponent } from './group/group.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
@NgModule({
  declarations: [
    ItemAppComponent,
    ItemComponent,
    ItemListComponent,
    GroupListComponent,
    GroupComponent,
  ],
  imports: [
    CommonModule,
    ItemRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    ContextMenuModule,
    InputTextareaModule,
    ReactiveFormsModule,
    ConfirmPopupModule,
    SkeletonModule,
    DropdownModule,
    DialogModule,
    CustomChipModule,
    ProgressSpinnerModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ]
})
export class BodyModule { }
