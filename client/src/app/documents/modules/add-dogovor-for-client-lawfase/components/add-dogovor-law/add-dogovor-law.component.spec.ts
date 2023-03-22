import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDogovorLawComponent } from './add-dogovor-law.component';

describe('AddDogovorLawComponent', () => {
  let component: AddDogovorLawComponent;
  let fixture: ComponentFixture<AddDogovorLawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDogovorLawComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDogovorLawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
