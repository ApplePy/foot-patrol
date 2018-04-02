import { Volunteer } from './volunteer';

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
}
