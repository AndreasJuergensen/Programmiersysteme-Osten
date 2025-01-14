import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    DrawingActivityComponent,
    DrawingArcComponent,
    DrawingPlaceComponent,
    DrawingTransitionsComponent,
} from './components';
import { DrawingBoxComponent } from './components/drawing-box.component';
import { DrawingAreaComponent } from './drawing-area.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';

@NgModule({
    declarations: [
        DrawingAreaComponent,
        DrawingActivityComponent,
        DrawingBoxComponent,
        DrawingArcComponent,
        DrawingPlaceComponent,
        DrawingTransitionsComponent,
    ],
    imports: [CommonModule, MatCheckboxModule, ContextMenuComponent],
    exports: [DrawingAreaComponent],
})
export class DrawingAreaModule {}
