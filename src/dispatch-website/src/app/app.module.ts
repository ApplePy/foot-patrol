import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {FtpRequestService} from './ftp-request.service';
import { AppComponent } from './app.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { RequestListComponent } from './request-list/request-list.component';
import { AppRoutingModule } from './/app-routing.module';
import { AddRequestComponent } from './add-request/add-request.component';
import {HttpClientModule} from '@angular/common/http';
import {AgmCoreModule} from '@agm/core';
import { MapGeneralComponent } from './map-general/map-general.component';
import { EditRequestComponent } from './edit-request/edit-request.component';
import { VolunteerListComponent } from './volunteer-list/volunteer-list.component';
import { EditVolunteerpairComponent } from './edit-volunteerpair/edit-volunteerpair.component';
import { AddPairComponent } from './add-pair/add-pair.component';
import { AddVolunteerComponent } from './add-volunteer/add-volunteer.component';
import { EditVolunteerComponent } from './edit-volunteer/edit-volunteer.component';
import {SuiModule} from 'ng2-semantic-ui';
import { LoginPageComponent } from './login-page/login-page.component';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { DispatcherListComponent } from './dispatcher-list/dispatcher-list.component';
import { DemoDispatchService } from './demo-dispatch.service';
import { EditDispatcherComponent } from './edit-dispatcher/edit-dispatcher.component';
import { AddDispatcherComponent } from './add-dispatcher/add-dispatcher.component';

@NgModule({
  declarations: [
    AppComponent,
    RequestListComponent,
    AddRequestComponent,
    MapGeneralComponent,
    EditRequestComponent,
    VolunteerListComponent,
    EditVolunteerpairComponent,
    AddPairComponent,
    AddVolunteerComponent,
    EditVolunteerComponent,
    LoginPageComponent,
    HeaderComponent,
    DispatcherListComponent,
    EditDispatcherComponent,
    AddDispatcherComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    SuiModule,
    FormsModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBCuq_f6oftSWJxY9D8SnQ3wcqtdCZj_u8'
    })
  ],

  providers: [AuthService,
  AuthGuard,
  FtpRequestService,
  DemoDispatchService],
  bootstrap: [AppComponent],
})
export class AppModule { }
