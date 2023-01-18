import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientLawfaseDogovorComponent } from './add-client-lawfase-dogovor.component';

describe('AddClientLawfaseDogovorComponent', () => {
  let component: AddClientLawfaseDogovorComponent;
  let fixture: ComponentFixture<AddClientLawfaseDogovorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClientLawfaseDogovorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientLawfaseDogovorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
