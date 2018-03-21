import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDispatcherComponent } from './edit-dispatcher.component';

describe('EditDispatcherComponent', () => {
  let component: EditDispatcherComponent;
  let fixture: ComponentFixture<EditDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
