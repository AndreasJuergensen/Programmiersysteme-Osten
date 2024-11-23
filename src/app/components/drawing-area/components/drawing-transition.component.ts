import { Component, Input } from '@angular/core';
import { Transition } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-transition]',
    template: `
        <svg:rect
            [attr.x]="transition.coordinates.x - width / 2"
            [attr.y]="transition.coordinates.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
        />
        <svg:text
            [attr.x]="transition.coordinates.x - width / 2"
            [attr.y]="transition.coordinates.y + height + 5"
        >
            {{ transition.id }}
        </svg:text>
    `,
    styles: ``,
})
export class DrawingTransitionsComponent {
    @Input({ required: true }) transition!: Transition;

    readonly height: number = environment.drawingElements.transitions.height;
    readonly width: number = environment.drawingElements.transitions.height;
}
