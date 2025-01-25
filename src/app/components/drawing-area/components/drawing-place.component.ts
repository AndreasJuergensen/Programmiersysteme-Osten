import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Place } from '../models';

@Component({
    selector: 'svg:g[app-drawing-place]',
    template: `
        <!--
        Using ellipse to draw a circle. A bug prevents setting background for
        circle element.
        -->
        <svg:ellipse
            [attr.cx]="place.x"
            [attr.cy]="place.y"
            [attr.rx]="radius"
            [attr.ry]="radius"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="place.x - place.id.length * 4.8"
            [attr.y]="place.y + radius + strokeWidth / 2 + 20"
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

    readonly bgColor: string = environment.drawingElements.places.bgColor;
    readonly bgOpacity: string = environment.drawingElements.places.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.places.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.places.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.places.strokeWidth;
}
