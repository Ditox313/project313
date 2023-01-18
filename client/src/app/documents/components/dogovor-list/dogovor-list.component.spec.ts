import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogovorListComponent } from './dogovor-list.component';

describe('DogovorListComponent', () => {
  let component: DogovorListComponent;
  let fixture: ComponentFixture<DogovorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DogovorListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DogovorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
