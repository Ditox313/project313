import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowClientDogovorComponent } from './show-client-dogovor.component';

describe('ShowClientDogovorComponent', () => {
  let component: ShowClientDogovorComponent;
  let fixture: ComponentFixture<ShowClientDogovorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowClientDogovorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowClientDogovorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
