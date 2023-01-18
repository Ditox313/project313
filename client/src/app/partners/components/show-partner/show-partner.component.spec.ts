import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPartnerComponent } from './show-partner.component';

describe('ShowPartnerComponent', () => {
  let component: ShowPartnerComponent;
  let fixture: ComponentFixture<ShowPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowPartnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
