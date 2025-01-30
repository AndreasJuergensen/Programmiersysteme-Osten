import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Arc } from '../models';

@Component({
    selector: 'svg:g[app-drawing-loop-arc]',
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

        <svg:path
            [attr.d]="setPath(loopArc)"
            [attr.stroke]="'black'"
            [attr.stroke-width]="width"
            [attr.fill]="'none'"
            marker-end="url(#arrowhead)"
        ></svg:path>
    `,
    styles: ``,
})
export class DrawingLoopArcComponent {
    @Input({ required: true }) loopArc!: Arc;

    constructor() {}

    readonly width: number = environment.drawingElements.arcs.width;
    readonly color: string = environment.drawingElements.arcs.color;

    setPath(arc: Arc): string {
        return `M ${arc.x1 - 15} ${arc.y1 - 12} A 25 15 0 1 1 ${arc.x1 + 18} ${arc.y1 - 14}`;
    }
}
