import { Component } from '@angular/core';
import {Request} from './request';
import {FtpRequestService} from './ftp-request.service';
import {OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Foot-Patrol Dispatcher Website';
  
  constructor(private ftpRequestService: FtpRequestService){}

  ngOnInit(): void{
    this.getFPrequests();
  }

  requestOverflow: boolean;
  
  displayRequests: Request[]=[ ];

  getFPrequests():void{
    this.ftpRequestService.getRequests().then(requests =>{
      if(requests.length>10){this.requestOverflow=true;
        for(var i=0;i<10;i++){
          this.displayRequests[i]=requests[i];
        }
      }
      else{
        for(var i=0;i<requests.length;i++){
          this.displayRequests[i]=requests[i];
        }
      }
    });
  }  
}





