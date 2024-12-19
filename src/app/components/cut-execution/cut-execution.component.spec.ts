import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutExecutionComponent } from './cut-execution.component';

describe('CutExecutionComponent', () => {
  let component: CutExecutionComponent;
  let fixture: ComponentFixture<CutExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CutExecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CutExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
