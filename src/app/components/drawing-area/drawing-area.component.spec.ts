import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingAreaComponent } from './drawing-area.component';

describe('DrawingAreaComponent', () => {
  let component: DrawingAreaComponent;
  let fixture: ComponentFixture<DrawingAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
