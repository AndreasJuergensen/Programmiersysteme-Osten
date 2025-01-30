import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Place } from '../models';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';

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
            [classList]="'draggable confine'"
            (mousedown)="startDrag($event)"
            (mousemove)="drag($event)"
            (mouseup)="endDrag($event, place)"
            (mouseleave)="endDrag($event, place)"
        />
        <svg:text
            [attr.x]="place.x - place.id.length * 3.8"
            [attr.y]="place.y + radius + strokeWidth / 2 + 20"
            [attr.font-size]="13"
        >
            {{ place.id }}
        </svg:text>
    `,
    styles: `
        circle {
            fill: black;
        }
        ellipse:hover {
            cursor: move;
        }
    `,
})
export class DrawingPlaceComponent {
    @Input({ required: true }) place!: Place;

    constructor(
        private _positionForActivitiesService: PositionForActivitiesService,
    ) {}

    readonly radius: number = environment.drawingElements.places.radius;

    readonly bgColor: string = environment.drawingElements.places.bgColor;
    readonly bgOpacity: string = environment.drawingElements.places.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.places.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.places.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.places.strokeWidth;

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
                    this.place.id,
                    'place',
                    this.dx,
                    this.dy,
                );
            }
        }
    }

    endDrag(event: MouseEvent, place: Place) {
        this.elementSelected = null;
        if (this.mouseClicked) {
            this._positionForActivitiesService.updateEndPositionOfElement(
                this.place.id,
                'place',
                this.place.x,
                this.place.y,
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
