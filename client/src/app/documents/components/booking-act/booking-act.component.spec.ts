import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingActComponent } from './booking-act.component';

describe('BookingActComponent', () => {
  let component: BookingActComponent;
  let fixture: ComponentFixture<BookingActComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingActComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingActComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
