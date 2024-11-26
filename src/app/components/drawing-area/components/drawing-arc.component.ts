import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-arc]',
    template: `
        <svg:defs>
            <svg:marker
                id="arrowhead"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="color"
                    [attr.stroke]="color"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
        </svg:defs>

        <svg:line
            [attr.x1]="arc.x1"
            [attr.y1]="arc.y1"
            [attr.x2]="arc.x2"
            [attr.y2]="arc.y2"
            [attr.stroke]="color"
            [attr.stroke-width]="width"
            marker-end="url(#arrowhead)"
        />
    `,
    styles: ``,
})
export class DrawingArcComponent {
    @Input({ required: true }) arc!: Arc;

    readonly color: string = environment.drawingElements.arcs.color;
    readonly width: number = environment.drawingElements.arcs.width;
}
