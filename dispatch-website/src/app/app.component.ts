import { Component } from '@angular/core';
import {Request} from './request';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Foot-Patrol Dispatcher Website';
  
  requestOverflow: boolean;

  storedRequests: Request[];

  displayRequests: Request[]=[
    {id:1, name: 'test1', location: 'Building 1', time: 1130},
    {id:2, name: 'test2', location: 'Building 2', time: 230},
    {id:3, name: 'test3', location: 'Building 3', time: 1700}
  ];

  getFPrequests(newRequests){
    if(newRequests.size()>10){this.requestOverflow=true;}
    for(var i=0;i<10;i++){
        this.displayRequests[i]=newRequests[i];
    }
  }

}





