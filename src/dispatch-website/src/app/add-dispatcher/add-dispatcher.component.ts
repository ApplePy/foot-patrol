import { Component, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { Dispatcher } from '../dispatcher';
import { DemoDispatchService } from '../demo-dispatch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-dispatcher',
  templateUrl: './add-dispatcher.component.html',
  styleUrls: ['./add-dispatcher.component.css']
})
export class AddDispatcherComponent implements OnInit {

  dispatcher: Dispatcher;

  constructor(private demoDispatch: DemoDispatchService, private router: Router) { }

  ngOnInit() {
  }

  addDisp() {
    this.demoDispatch.addDispatcher(this.dispatcher);
    this.router.navigateByUrl('/dispatcher-list');
  }

}
