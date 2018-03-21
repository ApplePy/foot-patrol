import { Injectable } from '@angular/core';
import { Dispatcher } from './dispatcher';

@Injectable()
export class DemoDispatchService {

  dispatchers: Dispatcher[] = [{
    name: 'John Smith',
    uwo_id: 'jsmith@uwo.ca',
  }, {
    name: 'Jane Widget',
    uwo_id: 'jwidget87@uwo.ca',
  }];

  constructor() { }

}
