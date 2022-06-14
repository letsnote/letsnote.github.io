import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'rename-body',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent implements OnInit {

  @Input()
  formGroupInput: FormGroup = new FormGroup({});

  constructor() { }

  ngOnInit(): void {

  }

}
