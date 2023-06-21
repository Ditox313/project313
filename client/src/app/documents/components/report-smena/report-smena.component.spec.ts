import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSmenaComponent } from './report-smena.component';

describe('ReportSmenaComponent', () => {
  let component: ReportSmenaComponent;
  let fixture: ComponentFixture<ReportSmenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSmenaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSmenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
