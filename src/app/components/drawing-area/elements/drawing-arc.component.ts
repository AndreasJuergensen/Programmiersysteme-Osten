import { Component, Input } from '@angular/core';
import { Arc } from './elements';

@Component({
    selector: 'svg:g[app-drawing-arc]',
    template: `
        <svg:defs>
            <svg:marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refY="4"
                orient="auto"
            >
                <svg:path d="M0,0 V8 L10,4 Z"></svg:path>
            </svg:marker>
        </svg:defs>

        <svg:line
            [attr.x1]="arc.start.coordinates.x"
            [attr.y1]="arc.start.coordinates.y"
            [attr.x2]="arc.end.coordinates.x - 20"
            [attr.y2]="arc.end.coordinates.y"
            marker-end="url(#arrowhead)"
        />
    `,
    styles: `
        line {
            stroke: black;
            stroke-width: 1;
        }
        path {
            stroke: black;
            fill: black;
        }
    `,
})
export class DrawingArcComponent {
    @Input({ required: true }) arc!: Arc;
}
