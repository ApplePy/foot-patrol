import { Component, OnInit } from '@angular/core';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core/core.module';

@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css'],
})

export class MapGeneralComponent implements OnInit {

  // ignore lint, the number declaration is needed to make the map work
  lat: number = 43.00959710000001;
  lng: number = -81.27373360000001;


  TestList: Volunteer[] = [
    { name: 'a', late: 1, long: 2 },
    { name: 'b', late: 3, long: 4 },
    { name: 'c', late: 5, long: 6 },
    { name: 'd', late: 7, long: 8 },
    { name: 'e', late: 9, long: 10 },
    { name: 'f', late: 11, long: 12 }
  ];

  constructor() { }

  ngOnInit() {
  }





}

class Volunteer {
  name: string;
  late: number;
  long: number;
}
