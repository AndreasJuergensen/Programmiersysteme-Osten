import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Transition } from '../models';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';

@Component({
    selector: 'svg:g[app-drawing-transition]',
    template: `
        <svg:rect
            [attr.x]="transition.x - width / 2"
            [attr.y]="transition.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
            [classList]="'draggable confine'"
            (mousedown)="startDrag($event)"
            (mousemove)="drag($event)"
            (mouseup)="endDrag($event, transition)"
            (mouseleave)="endDrag($event, transition)"
        />
        <svg:text
            [attr.x]="transition.x - transition.name.length * 4.8"
            [attr.y]="transition.y + (height + strokeWidth) / 2 + 20"
        >
            {{ transition.name }}
        </svg:text>
    `,
    styles: `
        rect:hover {
            cursor: move;
        }
    `,
})
export class DrawingTransitionComponent {
    @Input({ required: true }) transition!: Transition;
    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
        private _positionForActivitiesService: PositionForActivitiesService,
    ) {}

    readonly height: number = environment.drawingElements.transitions.height;
    readonly width: number = environment.drawingElements.transitions.height;

    readonly bgColor: string = environment.drawingElements.transitions.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.transitions.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.transitions.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.transitions.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.transitions.strokeWidth;

    mouseClicked: boolean = false;
    offset: any;
    transform: any;
    elementSelected: any;

    dx: number = 0;
    dy: number = 0;

    bbox: any;

    boundaryX1: number = 0;
    boundaryX2: number = 0;
    boundaryY1: number = 0;
    boundaryY2: number = 0;

    minX: number = 0;
    maxX: number = 0;
    minY: number = 0;
    maxY: number = 0;

    startDrag(event: MouseEvent) {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        const target = event.target as SVGRectElement;
        this.mouseClicked = true;

        this.setBoundary(svg);

        if (target.classList.contains('draggable')) {
            this.offset = this.getMousePosition(event);
            this.elementSelected = target;

            const transforms = this.elementSelected.transform.baseVal;

            if (target.classList.contains('confine')) {
                this.bbox = target.getBBox();
                this.minX = this.boundaryX1 - this.bbox.x;
                this.maxX = this.boundaryX2 - this.bbox.x - this.bbox.width;
                this.minY = this.boundaryY1 - this.bbox.y;
                this.maxY = this.boundaryY2 - this.bbox.y - this.bbox.height;
            }

            if (
                transforms.length === 0 ||
                transforms.getItem(0).type !==
                    SVGTransform.SVG_TRANSFORM_TRANSLATE
            ) {
                const translate = svg.createSVGTransform();
                translate.setTranslate(0, 0);

                this.elementSelected.transform.baseVal.insertItemBefore(
                    translate,
                    0,
                );
            }

            this.transform = transforms.getItem(0);
            this.offset.x -= this.transform.matrix.e;
            this.offset.y -= this.transform.matrix.f;
        }
    }

    drag(event: MouseEvent) {
        const target = event.target as SVGRectElement;
        if (this.elementSelected !== null && this.mouseClicked === true) {
            event.preventDefault();
            const coord = this.getMousePosition(event);

            if (this.transform !== undefined) {
                this.dx = coord.x - this.offset.x;
                this.dy = coord.y - this.offset.y;

                if (target.classList.contains('confine')) {
                    if (this.dx < this.minX) {
                        this.dx = this.minX;
                    } else if (this.dx > this.maxX) {
                        this.dx = this.maxX;
                    }

                    if (this.dy < this.minY) {
                        this.dy = this.minY;
                    } else if (this.dy > this.maxY) {
                        this.dy = this.maxY;
                    }
                }

                this._positionForActivitiesService.updateElementPosition(
                    this.transition.id,
                    'transition',
                    this.dx,
                    this.dy,
                );
            }
        }
    }

    endDrag(event: MouseEvent, pltransitionace: Transition) {
        this.elementSelected = null;
        if (this.mouseClicked) {
            this._positionForActivitiesService.updateEndPositionOfElement(
                this.transition.id,
                'transition',
                this.transition.x,
                this.transition.y,
                this.dx,
                this.dy,
            );
            this.mouseClicked = false;
        }
    }

    private getMousePosition(event: MouseEvent) {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        var CTM = svg.getScreenCTM();

        if (!CTM) {
            throw new Error('CTM is null');
        }

        return {
            x: (event.clientX - CTM.e) / CTM.a,
            y: (event.clientY - CTM.f) / CTM.d,
        };
    }

    private setBoundary(svg: SVGSVGElement): void {
        const drawingArea = document.getElementById('drawingArea');
        if (drawingArea && svg) {
            const drawingAreaBox = drawingArea.getBoundingClientRect();
            const svgBox = svg.getBoundingClientRect();

            this.boundaryX2 = drawingAreaBox.width;
            this.boundaryY2 = drawingAreaBox.height;

            if (svgBox.width > drawingAreaBox.width) {
                this.boundaryX2 = svgBox.width;
            }

            if (svgBox.height > drawingAreaBox.height) {
                this.boundaryY2 = svgBox.height;
            }
        }
    }
}
