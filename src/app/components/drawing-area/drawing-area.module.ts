import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import {
    DrawingActivityComponent,
    DrawingArcComponent,
    DrawingBoxArcComponent,
    DrawingPlaceComponent,
    DrawingTransitionComponent,
} from './components';
import { DrawingBoxComponent } from './components/drawing-box.component';
import { DrawingAreaComponent } from './drawing-area.component';
import { DrawingInvisibleTransitionComponent } from './components/drawing-invisible-transition.component';

@NgModule({
    declarations: [
        DrawingAreaComponent,
        DrawingActivityComponent,
        DrawingBoxComponent,
        DrawingArcComponent,
        DrawingBoxArcComponent,
        DrawingPlaceComponent,
        DrawingTransitionComponent,
        DrawingInvisibleTransitionComponent
    ],
    imports: [CommonModule, MatCheckboxModule, ContextMenuComponent],
    exports: [DrawingAreaComponent],
})
export class DrawingAreaModule {}
