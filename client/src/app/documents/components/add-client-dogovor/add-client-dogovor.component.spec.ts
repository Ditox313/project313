import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientDogovorComponent } from './add-client-dogovor.component';

describe('AddClientDogovorComponent', () => {
  let component: AddClientDogovorComponent;
  let fixture: ComponentFixture<AddClientDogovorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClientDogovorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientDogovorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
