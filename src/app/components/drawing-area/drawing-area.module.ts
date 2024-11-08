import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawingAreaComponent } from './drawing-area.component';
import {
    DrawingActivityComponent,
    DrawingArcComponent,
    DrawingPlaceComponent,
    DrawingTransitionsComponent,
} from './elements';

@NgModule({
    declarations: [
        DrawingAreaComponent,
        DrawingActivityComponent,
        DrawingArcComponent,
        DrawingPlaceComponent,
        DrawingTransitionsComponent,
    ],
    imports: [CommonModule],
    exports: [DrawingAreaComponent],
})
export class DrawingAreaModule {}
