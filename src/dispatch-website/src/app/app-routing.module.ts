import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router';
import {RequestListComponent} from './request-list/request-list.component';
import {AddRequestComponent} from './add-request/add-request.component';
import { MapGeneralComponent } from './map-general/map-general.component';
import { LoginPageComponent } from './login-page/login-page.component';

const routes: Routes = [
  {path: 'request-list', component: RequestListComponent},
  {path: 'add-request', component: AddRequestComponent},
  {path: 'map', component: MapGeneralComponent},
  {path: 'login', component: LoginPageComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
