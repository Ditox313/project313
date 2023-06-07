import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmenaListComponent } from './smena-list.component';

describe('SmenaListComponent', () => {
  let component: SmenaListComponent;
  let fixture: ComponentFixture<SmenaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmenaListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmenaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
