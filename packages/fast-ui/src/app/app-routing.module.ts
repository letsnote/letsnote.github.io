import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ItemListComponent } from './item-list/item-list.component';
import { SettingComponent } from './setting/setting.component';
import { ShareComponent } from './share/share.component';

const routes: Routes = [
  { path: 'setting', component: SettingComponent },
  { path: 'share', component: ShareComponent },
  { path: 'groups', loadChildren: () => import('./body/body.module').then(m => m.BodyModule) }, 
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
