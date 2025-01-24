import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import {
    DrawingActivityComponent,
    DrawingArcComponent,
    DrawingBoxArcComponent,
    DrawingPlaceComponent,
    DrawingTransitionsComponent,
} from './components';
import { DrawingBoxComponent } from './components/drawing-box.component';
import { DrawingAreaComponent } from './drawing-area.component';

@NgModule({
    declarations: [
        DrawingAreaComponent,
        DrawingActivityComponent,
        DrawingBoxComponent,
        DrawingArcComponent,
        DrawingBoxArcComponent,
        DrawingPlaceComponent,
        DrawingTransitionsComponent,
    ],
    imports: [CommonModule, MatCheckboxModule, ContextMenuComponent],
    exports: [DrawingAreaComponent],
})
export class DrawingAreaModule {}
