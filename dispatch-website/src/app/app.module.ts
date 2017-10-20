import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FtpRequestService} from './ftp-request.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [FtpRequestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
