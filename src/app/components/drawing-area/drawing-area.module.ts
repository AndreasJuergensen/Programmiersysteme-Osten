import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawingAreaComponent } from './drawing-area.component';
import {
    DrawingActivityComponent,
    DrawingArcComponent,
    DrawingPlaceComponent,
    DrawingTransitionsComponent,
} from './components';
import { DrawingBoxComponent } from './components/drawing-box.component';

@NgModule({
    declarations: [
        DrawingAreaComponent,
        DrawingActivityComponent,
        DrawingBoxComponent,
        DrawingArcComponent,
        DrawingPlaceComponent,
        DrawingTransitionsComponent,
    ],
    imports: [CommonModule],
    exports: [DrawingAreaComponent],
})
export class DrawingAreaModule {}
