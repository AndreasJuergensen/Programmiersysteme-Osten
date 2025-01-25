import { Component, Input } from '@angular/core';
import { Transition } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-invisible-transition]',
    template: `
        <svg:rect
            [attr.x]="invisibleTransition.x - width / 2"
            [attr.y]="invisibleTransition.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="invisibleTransition.x"
            [attr.y]="invisibleTransition.y + (height + strokeWidth) / 2 + 20"
        >
            {{ invisibleTransition.name }}
        </svg:text>
    `,
    styles: ``,
})
export class DrawingInvisibleTransitionComponent {
    @Input({ required: true }) invisibleTransition!: Transition;

    readonly height: number =
        environment.drawingElements.invisibleTransitions.height;
    readonly width: number =
        environment.drawingElements.invisibleTransitions.width;

    readonly bgColor: string =
        environment.drawingElements.invisibleTransitions.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.invisibleTransitions.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.invisibleTransitions.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.invisibleTransitions.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.invisibleTransitions.strokeWidth;
}
