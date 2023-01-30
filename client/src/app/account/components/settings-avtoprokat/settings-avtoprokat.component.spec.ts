import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAvtoprokatComponent } from './settings-avtoprokat.component';

describe('SettingsAvtoprokatComponent', () => {
  let component: SettingsAvtoprokatComponent;
  let fixture: ComponentFixture<SettingsAvtoprokatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAvtoprokatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAvtoprokatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
