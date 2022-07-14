import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ItemListComponent } from './item-list/item-list.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [
  // { path: '', component: GroupListComponent }
  // , { path: 'groups/:groupId', component: ItemListComponent }
  // , 
  { path: 'setting', component: SettingComponent }
  ,
  { path: 'groups', loadChildren: () => import('./body/body.module').then(m => m.BodyModule) }, { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
