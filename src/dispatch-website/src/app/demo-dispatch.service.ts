import { Injectable } from '@angular/core';
import { Dispatcher } from './dispatcher';

@Injectable()
export class DemoDispatchService {

  dispatchers: Dispatcher[] = [{
    id: 1,
    name: 'John Smith',
    uwo_id: 'jsmith@uwo.ca',
  }, {
    id: 2,
    name: 'Jane Widget',
    uwo_id: 'jwidget87@uwo.ca',
  }];

  constructor() { }

  getDispatchers() {
    return this.dispatchers;
  }
}
