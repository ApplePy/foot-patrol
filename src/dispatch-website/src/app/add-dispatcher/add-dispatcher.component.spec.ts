import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDispatcherComponent } from './add-dispatcher.component';

describe('AddDispatcherComponent', () => {
  let component: AddDispatcherComponent;
  let fixture: ComponentFixture<AddDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
