import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSmenaComponent } from './add-smena.component';

describe('AddSmenaComponent', () => {
  let component: AddSmenaComponent;
  let fixture: ComponentFixture<AddSmenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSmenaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSmenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
