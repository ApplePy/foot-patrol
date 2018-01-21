import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router';
import {RequestListComponent} from './request-list/request-list.component';
import {AddRequestComponent} from './add-request/add-request.component';

const routes: Routes = [
  {path: 'request-list', component: RequestListComponent},
  {path: 'add-request', component: AddRequestComponent},
  {path: '', redirectTo: '/request-list', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
