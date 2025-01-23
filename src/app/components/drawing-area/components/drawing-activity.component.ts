import { Component, Input } from '@angular/core';
import { Activity, Box } from '../models';
import { environment } from 'src/environments/environment';
import { FallThroughHandlingService } from 'src/app/services/fall-through-handling.service';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { Subscription } from 'rxjs';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';

@Component({
    selector: 'svg:g[app-drawing-activity]',
    template: `
        <svg:rect
            [attr.x]="activity.x - width / 2"
            [attr.y]="activity.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
            [classList]="'draggable confine'"
            (click)="onActivityClick($event, activity)"
            (mousedown)="startDrag($event)"
            (mousemove)="drag($event)"
            (mouseup)="endDrag($event)"
            (mouseleave)="endDrag($event)"
        />
        <svg:text
            [attr.x]="activity.x"
            [attr.y]="activity.y + (height + strokeWidth) / 2 + 20"
        >
            {{ activity.id }}
        </svg:text>
    `,
    styles: `
        rect:hover {
            cursor: pointer;
            stroke-width: 5;
            stroke: #085c5c;
        }
        rect.activity-marked {
            stroke-width: 5;
            stroke: #085c5c;
        }
        .draggable {
            cursor: move;
        }
    `,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;

    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
        private _positionForActivitiesService: PositionForActivitiesService,
    ) {}

    readonly width: number = environment.drawingElements.activities.height;
    readonly height: number = environment.drawingElements.activities.height;

    readonly bgColor: string = environment.drawingElements.activities.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.activities.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.activities.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.activities.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.activities.strokeWidth;

    private _sub: Subscription | undefined;

    elementSelected: any;
    offset: any;
    transform: any;
    mouseClicked: boolean = false;

    bbox: any;

    boundaryX1: number = 0;
    boundaryX2: number = 0;
    boundaryY1: number = 0;
    boundaryY2: number = 0;

    minX: number = 0;
    maxX: number = 0;
    minY: number = 0;
    maxY: number = 0;

    ngOnInit(): void {
        this._sub = this._positionForActivitiesService.boxDimensions$.subscribe(
            (boxes) => {
                const relevantBox = boxes.find(
                    (box) => box.id === this.activity.dfgId,
                );

                if (relevantBox) {
                    this.boundaryX1 = relevantBox!.x - relevantBox!.width / 2;
                    this.boundaryX2 = this.boundaryX1 + relevantBox!.width;
                    this.boundaryY1 = relevantBox!.y - relevantBox!.height / 2;
                    this.boundaryY2 = this.boundaryY1 + relevantBox!.height;
                }
            },
        );
    }

    onActivityClick(event: Event, activity: Activity): void {
        const rect = event.target as SVGRectElement;
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        if (svg) {
            const activities = svg.querySelectorAll('rect');
            activities.forEach((activity) => {
                if (rect === activity) {
                    rect.classList.toggle('activity-marked');
                } else {
                    activity.classList.remove('activity-marked');
                }
            });
        }
        this._collectSelectedElementsService.updateSelectedActivity(
            activity.id,
        );
    }

    startDrag(event: MouseEvent) {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        const target = event.target as SVGRectElement;
        this.mouseClicked = true;

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
        if (this.elementSelected !== null) {
            event.preventDefault();
            const coord = this.getMousePosition(event);

            if (this.transform !== undefined) {
                let dx = coord.x - this.offset.x;
                let dy = coord.y - this.offset.y;

                if (target.classList.contains('confine')) {
                    if (dx < this.minX) {
                        dx = this.minX;
                    } else if (dx > this.maxX) {
                        dx = this.maxX;
                    }

                    if (dy < this.minY) {
                        dy = this.minY;
                    } else if (dy > this.maxY) {
                        dy = this.maxY;
                    }
                }

                this._positionForActivitiesService.updatePosition(
                    this.activity.id,
                    this.activity.dfgId,
                    dx,
                    dy,
                );
            }
        }
    }

    endDrag(event: MouseEvent) {
        this.elementSelected = null;
        if (this.mouseClicked) {
            this._positionForActivitiesService.updateCoordinatesOfArcs(
                this.activity.id,
                this.activity.dfgId,
                this.activity.x,
                this.activity.y,
            );
            this.mouseClicked = false;
            this._collectSelectedElementsService.resetSelectedArcs();
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
}
