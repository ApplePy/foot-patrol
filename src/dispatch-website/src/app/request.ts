import { Volunteer } from './volunteer';
import * as Moment from 'moment';

export class Request {
  id: number;
  name: string;
  from_location: string;
  to_location: string;
  additional_info: string;
  archived: boolean;
  timestamp: string;
  pairing: number;
  status: string; // ASSIGNED, COMPLETED, AVAILABLE, REJECTED. we can add more

  timestampString() {
    if (this.timestamp) {
      return Moment(this.timestamp).format('MMMM Do YYYY, h:mm:ss a');
    } else {
      return this.timestamp;
    }
  }
}
