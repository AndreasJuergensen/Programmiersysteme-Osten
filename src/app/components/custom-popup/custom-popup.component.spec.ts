import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPopupComponent } from './custom-popup.component';

describe('CustomPopupComponent', () => {
  let component: CustomPopupComponent;
  let fixture: ComponentFixture<CustomPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
