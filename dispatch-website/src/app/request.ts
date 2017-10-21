export class Request {
    id: number;
    name: string;
    location: string; //currently a string for location. switch to gps coordinates (number) when we get the map stuff going
    time: number; //change this type. probably a time type lying around somewhere
    //complete: boolean; 
  }