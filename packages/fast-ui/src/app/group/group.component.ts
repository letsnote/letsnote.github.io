import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  @Input()
  model: GroupModel | undefined;
  
  constructor() { }

  ngOnInit(): void {
  }
}

export interface GroupModel{
  title: string;
  itemCount: number;
}
