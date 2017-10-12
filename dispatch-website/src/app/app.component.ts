import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Foot-Patrol Dispatcher Website';
}
export class Request {
  id: number;
  name: string;
  location: string; //change this to the correct type when we determine what that is
  time: number; //change this to the correct type. probably a time type lying around somewhere
}