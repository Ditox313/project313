import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDogovorComponent } from './add-dogovor.component';

describe('AddDogovorComponent', () => {
  let component: AddDogovorComponent;
  let fixture: ComponentFixture<AddDogovorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDogovorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDogovorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
