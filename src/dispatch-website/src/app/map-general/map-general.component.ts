import { Component, OnInit } from '@angular/core';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core/core.module';
import { FtpRequestService } from '../ftp-request.service';
import { Router } from '@angular/router';
import { Volunteer } from '../volunteer';


@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css'],
})

export class MapGeneralComponent implements OnInit {

  // tslint:disable-next-line:no-inferrable-types
  lat: number = 43.00959710000001;
  // tslint:disable-next-line:no-inferrable-types
  lng: number = -81.27373360000001;
  // tslint:disable-next-line:no-inferrable-types
  zoom: number = 15;
  getRepeat: number;
  // this list is here to show that the markers work. delete this once the server connunication stuff for volunteer info is written
  displayList: DisplayVolunteer[] = [ ];

  constructor(private ftpService: FtpRequestService, private router: Router) {
    router.events.subscribe((val) => {
    //   // when the user navigates away from the page, stop getting requests
      clearInterval(this.getRepeat);
    });
  }

  ngOnInit() {
    this.getVolunteers();
    this.getRepeat = setInterval(this.getVolunteers.bind(this), 15000);
  }

  getVolunteers() {
    this.ftpService.getAllActiveVolunteers().subscribe(data => {
      for (let i = 0; i < data.volunteers.length; i++) {
        const IVname = data.volunteers[i].first_name + ' ' + data.volunteers[i].last_name;
        const Itimestamp = data.volunteers[i].timestamp;
        const Ilate = data.volunteers[i].latitude;
        const Ilong = data.volunteers[i].longitude;
        const displayV = new DisplayVolunteer(IVname, Ilate, Ilong, Itimestamp);
        this.displayList[i] = displayV;
      }
    });
  }



}

class DisplayVolunteer {

  constructor(vn: string, la: number, lo: number, ts: string) {
    this.Vname = vn;
    this.timestamp = ts;
    this.late = +la;
    this.long = +lo;
  }

  Vname: string;
  late: number;
  long: number;
  timestamp: string;
}
