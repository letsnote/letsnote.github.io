import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'custom-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})
export class ChipComponent implements OnInit {

  @Input()
  label: string = '';

  @Input("toggle")
  set _toggled(_toggled: boolean){
    this.setToggle(_toggled);
  }

  toggled: boolean = false;
  styleClass = '';

  @Output("toggle")
  clickEmitter = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick(){
    this.setToggle(!this.toggled);
    this.clickEmitter.next(this.toggled);
  }

  setToggle(toggled: boolean){
    if(this.toggled == toggled)
      return;
    this.toggled = toggled;
    if(this.toggled){
      this.styleClass = 'custom-chip-toggled';
    }else{
      this.styleClass = '';
    }
  }
}
