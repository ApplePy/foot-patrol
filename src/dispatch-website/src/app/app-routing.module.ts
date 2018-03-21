import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router';
import {RequestListComponent} from './request-list/request-list.component';
import {AddRequestComponent} from './add-request/add-request.component';
import { MapGeneralComponent } from './map-general/map-general.component';
import { LoginPageComponent } from './login-page/login-page.component';
import {AuthGuard} from './auth.guard';
import { DispatcherListComponent } from './dispatcher-list/dispatcher-list.component';

const routes: Routes = [
  {path: 'request-list', component: RequestListComponent, canActivate: [AuthGuard]},
  {path: 'add-request', component: AddRequestComponent, canActivate: [AuthGuard]},
  {path: 'map', component: MapGeneralComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginPageComponent},
  {path: 'dispatcher-list', component: DispatcherListComponent, canActivate: [AuthGuard]},
  {path: '', redirectTo: '/request-list', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
