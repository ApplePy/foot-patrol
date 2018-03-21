import { Injectable } from '@angular/core';
import { Dispatcher } from './dispatcher';

@Injectable()
export class DemoDispatchService {

  dispatchers: Dispatcher[];

  constructor() {
    this.dispatchers = [{
      id: 1,
      name: 'John Smith',
      uwo_id: 'jsmith@uwo.ca',
    }, {
      id: 2,
      name: 'Jane Widget',
      uwo_id: 'jwidget87@uwo.ca',
    }];
  }

  getDispatchers() {
    return this.dispatchers;
  }

  getDispatcher(id) {
    for (let i = 0; i < this.dispatchers.length; i++) {
      if (this.dispatchers[i].id == id) {
        return this.dispatchers[i];
      }
    }
  }

  addDispatcher(dispatcher: Dispatcher) {
    this.dispatchers.push(dispatcher);
  }

  updateDispatcher(dispatcher: Dispatcher) {
    for (let i = 0; i < this.dispatchers.length; i++) {
      if (this.dispatchers[i].id === dispatcher.id) {
        this.dispatchers[i] = dispatcher;
        break;
      }
    }
  }
}
