import { Component, Input } from '@angular/core';
import { Box } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-box]',
    template: `
        <svg:rect
            [attr.x]="box.x - box.width / 2"
            [attr.y]="box.y - box.height / 2"
            [attr.height]="box.height"
            [attr.width]="box.width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="box.x"
            [attr.y]="box.y + (box.height + strokeWidth) / 2 + 20"
        >
            {{ box.id }}
        </svg:text>
    `,
    styles: ``,
})
export class DrawingBoxComponent {
    @Input({ required: true }) box!: Box;

    readonly bgColor: string = environment.drawingElements.boxes.bgColor;
    readonly bgOpacity: string = environment.drawingElements.boxes.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.boxes.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.boxes.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.boxes.strokeWidth;
}
