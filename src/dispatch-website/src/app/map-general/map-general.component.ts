import { Component, OnInit } from '@angular/core';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core/core.module';
import { FtpRequestService } from '../ftp-request.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css'],
})

export class MapGeneralComponent implements OnInit {

  /* tslint:disable:no-magic-numbers number-literal-format */
  lat: number = 43.00959710000001;
  lng: number = -81.27373360000001;
  zoom: number = 15;
  /* tslint:enable:no-magic-numbers number-literal-format */
  getRepeat: number;
  // this list is here to show that the markers work. delete this once the server connunication stuff for volunteer info is written
  TestList: DisplayVolunteer[] = [
    { name: 'John Smith', late: 43.00849710000001, long: -81.27373360000001 , timestamp: '2017-10-26T06:51:05.000Z'},
    { name: 'Jane Smithe', late: 43.00979710000001, long: -81.27373360000001 , timestamp: '2017-10-26T06:51:05.000Z'},
    { name: 'Jack Schmit', late: 43.00969710000001, long: -81.27373360000001 , timestamp: '2017-10-26T06:51:05.000Z'}
  ];

  constructor(private ftpService: FtpRequestService, private router: Router) {
    // router.events.subscribe((val) => {
    //   // when the user navigates away from the page, stop getting requests
    //   clearInterval(this.getRepeat);
    // });
  }

  ngOnInit() {
    // this.getVolunteers();
    // this.getRepeat = setInterval(this.getVolunteers.bind(this), 1000);
  }

  // getVolunteers() {
  //   this.TestList = [];
  //   this.ftpService.getAllActiveVolunteers().subscribe(
  // }



}

class DisplayVolunteer {
  name: string;
  late: number;
  long: number;
  timestamp: string;
}
