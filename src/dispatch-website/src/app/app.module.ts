import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FtpRequestService} from './ftp-request.service';
import { AppComponent } from './app.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { RequestListComponent } from './request-list/request-list.component';
import { AppRoutingModule } from './/app-routing.module';
import { AddRequestComponent } from './add-request/add-request.component';

@NgModule({
  declarations: [
    AppComponent,
    RequestListComponent,
    AddRequestComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
