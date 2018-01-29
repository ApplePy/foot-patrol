import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-map-general',
  templateUrl: './map-general.component.html',
  styleUrls: ['./map-general.component.css']
})
export class MapGeneralComponent implements OnInit {

  // ignore lint, the number declaration is needed to make the map work
  lat: number = 51.234;
  lng: number = 7.345;

  constructor() { }

  ngOnInit() {
  }

}
