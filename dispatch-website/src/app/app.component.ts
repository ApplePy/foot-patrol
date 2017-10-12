import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Foot-Patrol Dispatcher Website';
  
  requests: Request[]=[
    {id:1, name: 'test1', location: '345 254', time: 1130},
    {id:2, name: 'test2', location: '1233 456', time: 230},
    {id:3, name: 'test3', location: '789 101112', time: 1700}
  ];
}
export class Request {
  id: number;
  name: string;
  location: string; //change this to the correct type when we determine what that is
  time: number; //change this to the correct type. probably a time type lying around somewhere
}



