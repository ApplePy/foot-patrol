import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FtpRequestService} from './ftp-request.service';
import { AppComponent } from './app.component';
import {HttpModule} from '@angular/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [FtpRequestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
