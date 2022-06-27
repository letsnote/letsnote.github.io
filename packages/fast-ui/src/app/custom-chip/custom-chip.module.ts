import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipComponent } from './chip/chip.component';
import { ChipModule } from 'primeng/chip';

@NgModule({
  declarations: [
    ChipComponent
  ],
  imports: [
    CommonModule,
    ChipModule
  ],
  exports: [
    ChipComponent
  ]
})
export class CustomChipModule { }
