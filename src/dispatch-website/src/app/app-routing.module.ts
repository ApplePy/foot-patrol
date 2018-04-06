import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RequestListComponent} from './request-list/request-list.component';
import {AddRequestComponent} from './add-request/add-request.component';
import { MapGeneralComponent } from './map-general/map-general.component';

import { EditRequestComponent } from './edit-request/edit-request.component';
import {VolunteerListComponent} from './volunteer-list/volunteer-list.component';
import {EditVolunteerpairComponent} from './edit-volunteerpair/edit-volunteerpair.component';
import {AddPairComponent} from './add-pair/add-pair.component';
import { AddVolunteerComponent } from './add-volunteer/add-volunteer.component';
import { EditVolunteerComponent } from './edit-volunteer/edit-volunteer.component';
import { LoginPageComponent } from './login-page/login-page.component';
import {AuthGuard} from './auth.guard';
import { DispatcherListComponent } from './dispatcher-list/dispatcher-list.component';
import { EditDispatcherComponent } from './edit-dispatcher/edit-dispatcher.component';
import { AddDispatcherComponent } from './add-dispatcher/add-dispatcher.component';

const routes: Routes = [
  {path: 'request-list', component: RequestListComponent, canActivate: [AuthGuard]},
  {path: 'volunteer-list', component: VolunteerListComponent, canActivate: [AuthGuard]},
  {path: 'add-request', component: AddRequestComponent, canActivate: [AuthGuard]},
  {path: 'add-pair', component: AddPairComponent, canActivate: [AuthGuard]},
  {path: 'map', component: MapGeneralComponent, canActivate: [AuthGuard]},
  {path: 'editPair/:id', component: EditVolunteerpairComponent, canActivate: [AuthGuard]},
  {path: 'editRequest/:id', component: EditRequestComponent, canActivate: [AuthGuard]},
  {path: 'add-volunteer', component: AddVolunteerComponent, canActivate: [AuthGuard]},
  {path: 'edit-volunteer/:id', component: EditVolunteerComponent, canActivate: [AuthGuard]},

  {path: 'request-list', component: RequestListComponent, canActivate: [AuthGuard]},
  {path: 'add-request', component: AddRequestComponent, canActivate: [AuthGuard]},
  {path: 'map', component: MapGeneralComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginPageComponent},
  {path: 'dispatcher-list', component: DispatcherListComponent, canActivate: [AuthGuard]},
  {path: 'edit-dispatcher/:id', component: EditDispatcherComponent, canActivate: [AuthGuard]},
  {path: 'add-dispatcher', component: AddDispatcherComponent, canActivate: [AuthGuard]},
  {path: '', redirectTo: '/request-list', pathMatch: 'full'},
  {path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
