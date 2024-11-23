import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Place } from '../models';

@Component({
    selector: 'svg:g[app-drawing-place]',
    template: `
        <svg:circle
            [attr.cx]="place.coordinates.x"
            [attr.cy]="place.coordinates.y"
            [attr.r]="radius"
        />
        <svg:text
            [attr.x]="place.coordinates.x - radius"
            [attr.y]="place.coordinates.y + 2 * radius + 5"
        >
            {{ place.id }}
        </svg:text>
    `,
    styles: `
        circle {
            fill: black;
        }
    `,
})
export class DrawingPlaceComponent {
    @Input({ required: true }) place!: Place;

    readonly radius: number = environment.drawingElements.places.radius;
}
