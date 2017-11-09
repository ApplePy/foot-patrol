import { Component, OnInit } from '@angular/core';
import {Request} from '../request';
import {FtpRequestService} from '../ftp-request.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css'],
  providers: [FtpRequestService]
})
export class RequestListComponent implements OnInit {

  constructor(private ftpRequestService: FtpRequestService){}
  
    ngOnInit(): void{
      setInterval(this.getFPrequests.bind(this),1000);
    }
  
    requestOverflow: boolean;
    
    displayRequests: Request[]=[ ];
    storedRequests: Request[]=[];
  
    getFPrequests():void{
      this.ftpRequestService.getRequests().then(requests =>{
        if(requests.constructor===Array){

        if(requests.length>0){
          if(requests.length>10){
            this.requestOverflow=true;
            for(var i=0;i<10;i++){
              this.storedRequests.push(requests[i]);
            }
          }
          else{
            for(var i=0;i<requests.length;i++){
              this.storedRequests.push(requests[i]);
            }
          }
          //iterate backward though stored requests when adding requests to displayRequests
          i=0;
          var j=this.storedRequests.length;
          if(j>10){
            while(--j>=this.storedRequests.length-10){this.displayRequests[i++]=this.storedRequests[j];}        
          }
          else{
            while(--j>=0){this.displayRequests[i++]=this.storedRequests[j];}
          }
        }
      }
      });
    }  
}
