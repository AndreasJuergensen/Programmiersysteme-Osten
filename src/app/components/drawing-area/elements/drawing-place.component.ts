import { Component, Input } from '@angular/core';
import { Place } from './elements';

@Component({
    selector: 'svg:g[app-drawing-place]',
    template: `
        <svg:circle
            [attr.cx]="place.coordinates.x"
            [attr.cy]="place.coordinates.y"
        />
        <svg:text
            [attr.x]="place.coordinates.x - 10"
            [attr.y]="place.coordinates.y + 25"
        >
            {{ place.id }}
        </svg:text>
    `,
    styles: `
        circle {
            r: 10px;
            fill: black;
        }
    `,
})
export class DrawingPlaceComponent {
    @Input({ required: true }) place!: Place;
}
