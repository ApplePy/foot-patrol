import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {FtpRequestService} from '../ftp-request.service';
import { VolunteerListComponent } from './volunteer-list.component';
import {FormControl, FormGroup, FormsModule} from '@angular/forms';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('VolunteerListComponent', () => {
  let component: VolunteerListComponent;
  let fixture: ComponentFixture<VolunteerListComponent>;

  const fakeVolunteerPairs = [{
    id: 2,
    active: true,
    volunteers: [{
      id: 3,
      uwo_id: 'Cstring@uwo.ca',
      first_name: 'Cjohn',
      last_name: 'Cjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 4,
      uwo_id: 'Dstring@uwo.ca',
      first_name: 'Djohn',
      last_name: 'Djohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }, {
    id: 3,
    active: true,
    volunteers: [{
      id: 5,
      uwo_id: 'Estring@uwo.ca',
      first_name: 'Ejohn',
      last_name: 'Ejohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 6,
      uwo_id: 'Fstring@uwo.ca',
      first_name: 'Fjohn',
      last_name: 'Fjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }, {
    id: 4,
    active: true,
    volunteers: [{
      id: 7,
      uwo_id: 'Gstring@uwo.ca',
      first_name: 'Gjohn',
      last_name: 'Gjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }, {
      id: 8,
      uwo_id: 'Hstring@uwo.ca',
      first_name: 'Hjohn',
      last_name: 'Hjohnson',
      disabled: false,
      latitude: '',
      longitude: '',
      timestamp: ''
    }]
  }];

  const fakeVolunteers =  [{
    id: 1,
    uwo_id: 'Astring@uwo.ca',
    first_name: 'Ajohn',
    last_name: 'Ajohnson',
    disabled: false,
    latitude: '',
    longitude: '',
    timestamp: ''
  }, {
    id: 2,
    uwo_id: 'Bstring@uwo.ca',
    first_name: 'Bjohn',
    last_name: 'Bjohnson',
    disabled: false,
    latitude: '',
    longitude: '',
    timestamp: ''
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
        RouterTestingModule],
      declarations: [ VolunteerListComponent ],
      providers: [FtpRequestService,
      HttpClient,
      HttpHandler]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolunteerListComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setup');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setup', () => {
    expect(component.setup).toHaveBeenCalled();
  });

  describe('setup', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VolunteerListComponent);
      component = fixture.componentInstance;
      spyOn(component.ftpService, 'getVolunteerPairs').and.returnValue({
        subscribe: () => this.fakeVolunteerPairs});
      spyOn(component.ftpService, 'getAllVolunteers').and.returnValue({
        subscribe: () => this.fakeVolunteers});
      component.setup();
      fixture.detectChanges();
    });

    // it('should get all volunteers', () => {
    //   expect(component.ftpService.getAllVolunteers).toHaveBeenCalled();
    //   expect(component.displayVolunteers).toBe(this.fakeVolunteers);
    // });
    // it('should get all volunteer pairs', () => {
    //   expect(component.ftpService.getVolunteerPairs).toHaveBeenCalled();
    //   expect(component.volunteerPairs).toBe(this.fakeVolunteerPairs);
    // });
  });

  describe('changePairView', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VolunteerListComponent);
      component = fixture.componentInstance;
      spyOn(component, 'setup');
      spyOn(component.ftpService, 'getVolunteerPairs').and.returnValue({
        subscribe: () => this.fakeVolunteerPairs});
      fixture.detectChanges();
    });

    // it('should get all active volunteer pairs when view is "active"', () => {
    //   component.changePairView('active');
    //   expect(component.ftpService.getVolunteerPairs).toHaveBeenCalled();
    //   fixture.detectChanges();
    //   expect(component.volunteerPairs).toBe(this.fakeVolunteerPairs);
    // });
    // it('should get all volunteers when view is "all"', () => {
    //   component.changePairView('all');
    //   expect(component.ftpService.getVolunteerPairs).toHaveBeenCalledWith(true);
    //   fixture.detectChanges();
    //   expect(component.volunteerPairs).toBe(this.fakeVolunteerPairs);
    // });
  });

  describe('changeVolunteerView', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VolunteerListComponent);
      component = fixture.componentInstance;
      spyOn(component, 'setup');
      spyOn(component.ftpService, 'getAllVolunteers').and.returnValue({
        subscribe: () => this.fakeVolunteers});
      spyOn(component.ftpService, 'getAllActiveVolunteers').and.returnValue({
        subscribe: () => this.fakeVolunteers});
      spyOn(component.ftpService, 'getAllInactiveVolunteers').and.returnValue({
        subscribe: () => this.fakeVolunteers});
      fixture.detectChanges();
    });

    // it('should get all volunteers when view is "all"', () => {
    //   component.changeVolunteerView('all');
    //   expect(component.ftpService.getAllVolunteers).toHaveBeenCalled();
    //   fixture.detectChanges();
    //   expect(component.displayVolunteers).toBe(this.fakeVolunteers);
    // });
    // it('should get all active volunteers when view is "active"', () => {
    //   component.changeVolunteerView('active');
    //   expect(component.ftpService.getAllActiveVolunteers).toHaveBeenCalled();
    //   fixture.detectChanges();
    //   expect(component.displayVolunteers).toBe(this.fakeVolunteers);
    // });
    // it('should get all inactive volunteers when view is "inactive"', () => {
    //   component.changeVolunteerView('inactive');
    //   expect(component.ftpService.getAllInactiveVolunteers).toHaveBeenCalled();
    //   fixture.detectChanges();
    //   expect(component.displayVolunteers).toBe(this.fakeVolunteers);
    // });
  });
});
