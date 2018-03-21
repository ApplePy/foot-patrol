import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { EditDispatcherComponent } from './edit-dispatcher.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('EditDispatcherComponent', () => {
  let component: EditDispatcherComponent;
  let fixture: ComponentFixture<EditDispatcherComponent>;

  const fakeDispatcher = {
    id: 1,
    uwo_id: 'Astring@uwo.ca',
    name: 'jona jameson'
  };
  const fakeActivateRoute = { // this definately isn't being used properly.

  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
      RouterTestingModule],
      declarations: [ EditDispatcherComponent ],
      providers: [{provide: ActivatedRoute, userValue: fakeActivateRoute}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDispatcherComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setup');
    component.dispatcher = this.fakeDispatcher;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
