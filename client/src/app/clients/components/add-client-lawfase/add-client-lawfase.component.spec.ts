import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientLawfaseComponent } from './add-client-lawfase.component';

describe('AddClientLawfaseComponent', () => {
  let component: AddClientLawfaseComponent;
  let fixture: ComponentFixture<AddClientLawfaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClientLawfaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientLawfaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
