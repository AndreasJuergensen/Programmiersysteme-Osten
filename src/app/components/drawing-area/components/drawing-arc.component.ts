import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';

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
            <svg:marker
                id="arrowhead-red"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="'red'"
                    [attr.stroke]="'red'"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
        </svg:defs>

        <svg:path
            [attr.d]="pathForLine(arc)"
            [attr.stroke]="'black'"
            [attr.stroke-width]="width"
            [attr.fill]="'none'"
            marker-end="url(#arrowhead)"
        ></svg:path>
    `,
    styles: ``,
})
export class DrawingArcComponent {
    @Input({ required: true }) arc!: Arc;

    constructor(
        private collectSelectedElementsService: CollectSelectedElementsService,
        private feedbackService: ShowFeedbackService,
        private petriNetManagementService: PetriNetManagementService,
    ) {}

    readonly width: number = environment.drawingElements.arcs.width;
    readonly color: string = environment.drawingElements.arcs.color;

    pathForLine(arc: Arc): string {
        if (!this.pathNecessary(arc)) {
            return `M ${arc.x1} ${arc.y1} L ${arc.x2} ${arc.y2}`;
        }

        const distance = Math.sqrt(
            Math.pow(arc.x2 - arc.x1, 2) + Math.pow(arc.y2 - arc.y1, 2),
        );

        const xm = (arc.x1 + arc.x2) / 2;
        const ym = (arc.y1 + arc.y2) / 2;

        const dx = (arc.x2 - arc.x1) / distance;
        const dy = (arc.y2 - arc.y1) / distance;

        const bowHeight = 50;

        const controlX = xm - dy * bowHeight;
        const controlY = ym + dx * bowHeight;

        return `M ${arc.x1} ${arc.y1} Q ${controlX} ${controlY} ${arc.x2} ${arc.y2}`;
    }

    private pathNecessary(arc: Arc): boolean {
        return (
            this.collectSelectedElementsService.isOverlayedArcInDFG(arc) ||
            this.petriNetManagementService.arcIsOverlayingArc(arc)
        );
    }
}
