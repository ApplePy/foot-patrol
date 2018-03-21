import { Component, OnInit } from '@angular/core';
import { DemoDispatchService } from '../demo-dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dispatcher } from '../dispatcher';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-dispatcher',
  templateUrl: './edit-dispatcher.component.html',
  styleUrls: ['./edit-dispatcher.component.css'],
  providers: [DemoDispatchService]
})
export class EditDispatcherComponent implements OnInit {

  dispatcher: Dispatcher;

  errorMsg: string;

  constructor(public route: ActivatedRoute,
  public demoDispatch: DemoDispatchService,
  private location: Location,
  private router: Router) { }

  ngOnInit() {
    this.setup();
  }
  setup() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.dispatcher = this.demoDispatch.getDispatcher(id.toLocaleString());
  }

  update() {
    this.demoDispatch.updateDispatcher(this.dispatcher);
    this.router.navigateByUrl('/dispatcher-list');
  }
}
