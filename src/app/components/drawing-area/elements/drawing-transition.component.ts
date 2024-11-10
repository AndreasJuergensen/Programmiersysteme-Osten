import { Component, Input } from '@angular/core';
import { Transition } from './elements';

@Component({
    selector: 'svg:g[app-drawing-transition]',
    template: `
        <svg:rect
            [attr.x]="transition.coordinates.x - 10"
            [attr.y]="transition.coordinates.y - 10"
        />
        <svg:text
            [attr.x]="transition.coordinates.x - 10"
            [attr.y]="transition.coordinates.y + 25"
        >
            {{ transition.id }}
        </svg:text>
    `,
    styles: `
        rect {
            height: 20px;
            width: 20px;
        }
    `,
})
export class DrawingTransitionsComponent {
    @Input({ required: true }) transition!: Transition;
}
