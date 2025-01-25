import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';
import { Subscription } from 'rxjs';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';

@Component({
    selector: 'svg:g[app-drawing-boxArc]',
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
            [attr.d]="setPath(boxArc)"
            [attr.stroke-width]="10"
            [attr.fill]="'none'"
            fill="transparent"
            pointer-events="all"
            (pointerenter)="changeLineColorOver($event, boxArc)"
            (pointerleave)="changeLineColorOut($event)"
            (click)="onLineClick($event, boxArc)"
        ></svg:path>
        <svg:path
            [attr.class]="'visiblePath'"
            [attr.d]="setPath(boxArc)"
            [attr.stroke]="'black'"
            [attr.stroke-width]="width"
            [attr.fill]="'none'"
            marker-end="url(#arrowhead)"
        ></svg:path>
    `,
    styles: `
        path:hover {
            cursor: pointer;
        }

        path.active {
            stroke: red !important;
        }

        path.hovered {
            stroke: red !important;
        }
    `,
})
export class DrawingBoxArcComponent {
    @Input({ required: true }) boxArc!: Arc;

    constructor(
        private collectSelectedElementsService: CollectSelectedElementsService,
        private feedbackService: ShowFeedbackService,
        private petriNetManagementService: PetriNetManagementService,
        private positionForActivitiesService: PositionForActivitiesService,
    ) {}

    readonly width: number = environment.drawingElements.arcs.width;
    readonly color: string = environment.drawingElements.arcs.color;
    private timeoutId: any;

    private _sub: Subscription | undefined;
    private _sub2: Subscription | undefined;

    private movingActivityID: string = '';
    private xTranslate = 0;
    private yTranslate = 0;
    private movedActivityIdToSetNewCoordinates: string = '';
    private updateCoordinates = false;

    ngOnInit(): void {
        this._sub =
            this.positionForActivitiesService.movingActivityInGraph$.subscribe(
                (position) => {
                    this.movingActivityID = position[0];
                    this.xTranslate = position[2];
                    this.yTranslate = position[3];
                },
            );

        this._sub2 =
            this.positionForActivitiesService.updateArcCoordinates$.subscribe(
                (coordinate) => {
                    this.movedActivityIdToSetNewCoordinates = coordinate[0];
                    this.updateCoordinates = true;
                },
            );
    }

    changeLineColorOver(event: Event, arc: Arc): void {
        const pathDummy = event.target as SVGPathElement;
        const path = pathDummy.nextElementSibling as SVGLineElement;
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (svg && path) {
            if (
                !svg.classList.contains('mouseDown') &&
                !path.classList.contains('active')
            ) {
                path.classList.add('hovered');
                path.setAttribute('marker-end', 'url(#arrowhead-red)');
            } else if (svg.classList.contains('mouseDown')) {
                this.timeoutId = setTimeout(() => {
                    if (
                        this.collectSelectedElementsService.isArcinSameDFG(arc)
                    ) {
                        if (!path.classList.contains('active')) {
                            path.classList.toggle('active');
                            path.setAttribute(
                                'marker-end',
                                'url(#arrowhead-red)',
                            );
                        } else {
                            path.classList.toggle('active');
                            path.setAttribute('marker-end', 'url(#arrowhead)');
                        }
                        this.collectSelectedElementsService.updateCollectedArcs(
                            arc,
                        );
                    } else {
                        this.feedbackService.showMessage(
                            'Arc not in same DFG',
                            true,
                        );
                    }
                }, 90);
            }
        }
    }

    changeLineColorOut(event: Event): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg && !svg.classList.contains('mouseDown')) {
            const rect = event.target as SVGRectElement;
            const line = rect.nextElementSibling as SVGLineElement;

            if (line && !line.classList.contains('active')) {
                line.classList.remove('hovered');
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
        }
    }

    onLineClick(event: Event, arc: Arc): void {
        const rect = event.target as SVGRectElement;
        const line = rect.nextElementSibling as SVGLineElement;

        if (this.collectSelectedElementsService.isDFGArc(arc)) {
            if (this.collectSelectedElementsService.isArcinSameDFG(arc)) {
                if (line) {
                    line.classList.toggle('active');
                }

                this.collectSelectedElementsService.updateCollectedArcs(arc);
            } else {
                this.feedbackService.showMessage('Arc not in same DFG', true);
            }
        } else {
            this.feedbackService.showMessage('Arc is not a DFGArc', true);
        }
    }

    setPath(arc: Arc): string {
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
