import * as Moment from 'moment';
export class Volunteer {
    id: number;
    uwo_id: string;
    first_name: string;
    last_name: string;
    disabled: boolean;
    latitude: string;
    longitude: string;
    timestamp: string;

    timestampString() {
      if (this.timestamp) {
        return Moment(this.timestamp).format('MMMM Do YYYY, h:mm:ss a');
      } else {
        return this.timestamp;
      }
    }
}
