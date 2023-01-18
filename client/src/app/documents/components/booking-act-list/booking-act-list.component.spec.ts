import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingActListComponent } from './booking-act-list.component';

describe('BookingActListComponent', () => {
  let component: BookingActListComponent;
  let fixture: ComponentFixture<BookingActListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingActListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingActListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
