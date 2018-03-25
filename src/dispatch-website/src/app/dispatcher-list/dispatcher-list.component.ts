import { Component, OnInit } from '@angular/core';
import { DemoDispatchService } from '../demo-dispatch.service';
import { Dispatcher } from '../dispatcher';
import {FormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispatcher-list',
  templateUrl: './dispatcher-list.component.html',
  styleUrls: ['./dispatcher-list.component.css'],
  providers: [DemoDispatchService]
})
export class DispatcherListComponent implements OnInit {

  dispatchers: Dispatcher[];

  constructor(private demoDispatch: DemoDispatchService, private router: Router) { }

  ngOnInit() {
    this.dispatchers = this.demoDispatch.getDispatchers();
  }

  editDispatcher(id) {
     this.router.navigateByUrl(`edit-dispatcher/${id}`);
  }

  addDispatcher() {
    this.router.navigateByUrl('add-dispatcher');
  }
}
