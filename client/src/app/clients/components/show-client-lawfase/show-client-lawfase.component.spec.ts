import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowClientLawfaseComponent } from './show-client-lawfase.component';

describe('ShowClientLawfaseComponent', () => {
  let component: ShowClientLawfaseComponent;
  let fixture: ComponentFixture<ShowClientLawfaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowClientLawfaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowClientLawfaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
