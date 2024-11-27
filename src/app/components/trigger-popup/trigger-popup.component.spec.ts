import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerPopupComponent } from './trigger-popup.component';

describe('TriggerPopupComponent', () => {
  let component: TriggerPopupComponent;
  let fixture: ComponentFixture<TriggerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriggerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
