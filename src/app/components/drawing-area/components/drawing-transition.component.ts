import { Component, Input } from '@angular/core';
import { Transition } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-transition]',
    template: `
        <svg:rect
            [attr.x]="transition.x - width / 2"
            [attr.y]="transition.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="transition.x"
            [attr.y]="transition.y + (height + strokeWidth) / 2 + 20"
        >
            {{ transition.name }}
        </svg:text>
    `,
    styles: ``,
})
export class DrawingTransitionsComponent {
    @Input({ required: true }) transition!: Transition;

    readonly height: number = environment.drawingElements.transitions.height;
    readonly width: number = environment.drawingElements.transitions.height;

    readonly bgColor: string = environment.drawingElements.transitions.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.transitions.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.transitions.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.transitions.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.transitions.strokeWidth;
}
