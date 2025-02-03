import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';

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
                id="arrowhead-pale"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="'#bebebe'"
                    [attr.stroke]="'#bebebe'"
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
            <svg:marker
                id="arrowhead-orange"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="'orange'"
                    [attr.stroke]="'orange'"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
            <svg:marker
                id="arrowhead-green"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="'green'"
                    [attr.stroke]="'green'"
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
            [attr.id]="getId(boxArc)"
            [attr.class]="classListAttributes()"
            [attr.d]="setPath(boxArc)"
            [attr.stroke]="'black'"
            [attr.stroke-width]="width"
            [attr.fill]="'none'"
            [attr.marker-end]="urlForMarker()"
        ></svg:path>
    `,
    styles: `
        path:hover {
            cursor: pointer;
        }
        path.active {
            stroke: #bebebe !important;
        }

        path.hovered {
            stroke: #bebebe !important;
        }

        path.correct {
            stroke: green !important;
        }

        path.possbiblyCorrect {
            stroke: orange !important;
        }

        path.wrong {
            stroke: red !important;
        }
    `,
})
export class DrawingBoxArcComponent {
    @Input({ required: true }) boxArc!: Arc;
    // @Input({ required: true }) showArcFeedback!: boolean;

    constructor(
        private collectSelectedElementsService: CollectSelectedElementsService,
        private feedbackService: ShowFeedbackService,
        private petriNetManagementService: PetriNetManagementService,
    ) {}

    private arcId: string = '';
    readonly width: number = environment.drawingElements.arcs.width;
    readonly color: string = environment.drawingElements.arcs.color;
    private timeoutId: any;

    ngOnInit() {
        this.arcId = `arc_${this.boxArc.start.id}_${this.boxArc.end.id}`;
    }

    getId(boxArc: Arc): string {
        return `arc_${boxArc.start.id}_${boxArc.end.id}`;
    }

    classListAttributes(): string {
        let classListAttributes: string = '';
        const attributes =
            this.collectSelectedElementsService.getArcClassListAttributes(
                this.arcId,
            )!;
        if (attributes) {
            attributes.forEach((attribute) => {
                classListAttributes = `${classListAttributes} ${attribute}`;
            });
        }

        return `visiblePath ${classListAttributes}`;
    }

    urlForMarker(): string {
        const classListAttributes: string[] | undefined =
            this.collectSelectedElementsService.getArcClassListAttributes(
                this.arcId,
            );
        let marker: string = 'url(#arrowhead)';

        if (classListAttributes) {
            if (classListAttributes.includes('active')) {
                marker = 'url(#arrowhead-pale)';
            }
            if (classListAttributes.includes('wrong')) {
                marker = 'url(#arrowhead-red)';
            }
            if (classListAttributes.includes('possbiblyCorrect')) {
                marker = 'url(#arrowhead-orange)';
            }
            if (classListAttributes.includes('correct')) {
                marker = 'url(#arrowhead-green)';
            }
        }

        return marker;
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
                this.collectSelectedElementsService.setArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
                path.setAttribute('marker-end', 'url(#arrowhead-pale)');
            } else if (svg.classList.contains('mouseDown')) {
                this.timeoutId = setTimeout(() => {
                    if (
                        this.collectSelectedElementsService.isArcinSameDFG(arc)
                    ) {
                        if (
                            !path.classList.contains('active') &&
                            !path.classList.contains('correct') &&
                            !path.classList.contains('possbiblyCorrect') &&
                            !path.classList.contains('wrong')
                        ) {
                            this.collectSelectedElementsService.toggleArcClassListAttributes(
                                this.arcId,
                                'active',
                            );
                            path.setAttribute(
                                'marker-end',
                                'url(#arrowhead-pale)',
                            );
                        } else {
                            this.collectSelectedElementsService.toggleArcClassListAttributes(
                                this.arcId,
                                'active',
                            );

                            if (path.classList.contains('correct')) {
                                this.collectSelectedElementsService.removeArcClassListAttributes(
                                    this.arcId,
                                    'correct',
                                );
                            }
                            if (path.classList.contains('possbiblyCorrect')) {
                                this.collectSelectedElementsService.removeArcClassListAttributes(
                                    this.arcId,
                                    'possbiblyCorrect',
                                );
                            }
                            if (path.classList.contains('wrong')) {
                                this.collectSelectedElementsService.removeArcClassListAttributes(
                                    this.arcId,
                                    'wrong',
                                );
                            }
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
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
        }
    }

    onLineClick(event: Event, arc: Arc): void {
        const rect = event.target as SVGRectElement;
        const line = rect.nextElementSibling as SVGLineElement;

        if (this.collectSelectedElementsService.isArcinSameDFG(arc)) {
            if (line) {
                this.collectSelectedElementsService.toggleArcClassListAttributes(
                    this.arcId,
                    'active',
                );
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
            }
            if (line.classList.contains('correct')) {
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'correct',
                );
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
            if (line.classList.contains('possbiblyCorrect')) {
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'possbiblyCorrect',
                );
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
            if (line.classList.contains('wrong')) {
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'wrong',
                );
                this.collectSelectedElementsService.removeArcClassListAttributes(
                    this.arcId,
                    'hovered',
                );
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
            this.collectSelectedElementsService.updateCollectedArcs(arc);
        } else {
            this.feedbackService.showMessage('Arc not in same DFG', true);
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
