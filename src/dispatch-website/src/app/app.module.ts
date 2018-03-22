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
import {SuiModule} from 'ng2-semantic-ui';

@NgModule({
  declarations: [
    AppComponent,
    RequestListComponent,
    AddRequestComponent,
    MapGeneralComponent
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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
