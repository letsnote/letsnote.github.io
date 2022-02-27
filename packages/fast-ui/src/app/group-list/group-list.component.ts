import { Component, Input, OnInit } from '@angular/core';
import { GroupModel } from '../group/group.component';

@Component({
  selector: 'group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {

  @Input()
  model: GroupListModel = {groups: []};
  constructor() { }

  ngOnInit(): void {
  }

}

export interface GroupListModel{
  groups: GroupModel[];
}