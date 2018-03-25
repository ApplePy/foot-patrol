import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVolunteerComponent } from './edit-volunteer.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditVolunteerComponent', () => {
  let component: EditVolunteerComponent;
  let fixture: ComponentFixture<EditVolunteerComponent>;

  const fakeVolunteer = {
    id: 1,
    uwo_id: 'Astring@uwo.ca',
    first_name: 'Ajohn',
    last_name: 'Ajohnson',
    disabled: false,
    latitude: '',
    longitude: '',
    timestamp: ''
  };

  const fakeActivateRoute = { // this still isn't being used properly.

  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
      RouterTestingModule],
      declarations: [ EditVolunteerComponent ],
      providers: [HttpClient,
      HttpHandler,
      {provide: ActivatedRoute, useValue: fakeActivateRoute}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVolunteerComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setup');
    component.volunteer = fakeVolunteer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
