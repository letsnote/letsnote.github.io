import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ConfigService } from '../setting/config.service';
import { getGroups } from 'hypothesis-data';
import { AnnotationCreationService } from '../service/annotation-creation.service';

@Component({
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private configService: ConfigService,
    private annotationService: AnnotationCreationService,
    private router: Router) { }

  title?: string;
  text?: string;
  url?: string;

  async ngOnInit() {
    this.title = this.route.snapshot.queryParams['title'];
    this.text = this.route.snapshot.queryParams['text'];
    this.url = this.route.snapshot.queryParams['url'];
    this.displayMoveGroupDialog = true;
    this.moveGroupDialogStatus = 'loading';
    this.groupList = [];
    try{
      let groups = await getGroups(this.configService.key);
      this.groupList = groups.map(g => ({id: g.id, name: g.name}));
    }catch(e){
      this.moveGroupDialogStatus = 'fail';
    }finally{
      this.moveGroupDialogStatus = 'loaded';
    }
  }
  
  async onSave(){
    if(this.selectedGroupToMoveForm.valid){
      await this.annotationService.createNewAnnotation(this.selectedGroupToMoveForm.value
        , {url: this.url, title: this.title, text: this.text});
      console.log('성공적으로 생성되었습니다.');
      this.router.navigate(['/groups', `${this.selectedGroupToMoveForm.value}`], {replaceUrl: true});
    }
  }

  onClose(){
    this.displayMoveGroupDialog = false;
    window.close();
  }

  selectedGroupToMoveForm = new FormControl(undefined, [Validators.required]);
  groupList: {id: string, name: string}[] = [];
  displayMoveGroupDialog = false;
  moveGroupDialogStatus: 'loading' | 'fail' | 'loaded' = 'loaded' ;
}
