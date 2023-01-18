import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowActBookingComponent } from './show-act-booking.component';

describe('ShowActBookingComponent', () => {
  let component: ShowActBookingComponent;
  let fixture: ComponentFixture<ShowActBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowActBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowActBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
