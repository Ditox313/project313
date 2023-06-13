import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSmenaComponent } from './view-smena.component';

describe('ViewSmenaComponent', () => {
  let component: ViewSmenaComponent;
  let fixture: ComponentFixture<ViewSmenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewSmenaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSmenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
