import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSnackbarPopupComponent } from './custom-snackbar-popup.component';

describe('CustomSnackbarPopupComponent', () => {
  let component: CustomSnackbarPopupComponent;
  let fixture: ComponentFixture<CustomSnackbarPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSnackbarPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSnackbarPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
