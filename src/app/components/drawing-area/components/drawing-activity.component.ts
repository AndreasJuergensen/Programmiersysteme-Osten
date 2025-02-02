import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';
import { environment } from 'src/environments/environment';
import { Activity } from '../models';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { last } from 'lodash';

@Component({
    selector: 'svg:g[app-drawing-activity]',
    template: `
        <svg:rect
            [attr.id]="activity.dfgId + '_' + activity.id"
            [attr.x]="activity.x - width / 2"
            [attr.y]="activity.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.rx]="radius"
            [attr.ry]="radius"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="activity.x - activity.id.length * 3.8"
            [attr.y]="activity.y + (height + strokeWidth) / 2 + 20"
            [attr.font-size]="13"
        >
            {{ activity.id }}
        </svg:text>
    `,
    styles: `
        rect:hover {
            cursor: pointer;
            stroke-width: 4;
            stroke-opacity: 0.5;
        }
        rect.activity-marked {
            stroke-width: 3;
            stroke: #d42f7c;
        }
        :host {
            will-change: transform;
        }
    `,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;
    //@Output() positionChanged = new EventEmitter<{ x: number; y: number }>();
    @Output() positionChanged = new EventEmitter<{
        x: number;
        y: number;
        xtl: number;
        ytl: number;
    }>();

    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
        private _positionForActivitiesService: PositionForActivitiesService,
        private _dragAndDropService: DragAndDropService,
        private _applicationStateService: ApplicationStateService,
    ) {}

    readonly width: number = environment.drawingElements.activities.height;
    readonly height: number = environment.drawingElements.activities.height;
    readonly radius: number = environment.drawingElements.activities.radius;

    readonly bgColor: string = environment.drawingElements.activities.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.activities.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.activities.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.activities.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.activities.strokeWidth;

    private boundaryX1: number = 0;
    private boundaryX2: number = 0;
    private boundaryY1: number = 0;
    private boundaryY2: number = 0;

    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';
    private startX = 0;
    private startY = 0;
    private translateX = 0;
    private translateY = 0;

    private xCoordinateInBox = 0;
    private yCoordinateInBox = 0;
    private mousePositionCurrent: [number, number] = [0, 0];
    private mousePositionInitial: [number, number] = [0, 0];

    private showEventLogs = false;

    ngOnInit() {
        this.startX = this.activity.x;
        this.startY = this.activity.y;

        this._applicationStateService.showEventLogs$.subscribe(
            (showEventLogs) => {
                if (this.showEventLogs === false && !showEventLogs === true) {
                    this.showEventLogs = !showEventLogs;
                }
            },
        );

        this._positionForActivitiesService.boxDimensions$.subscribe((boxes) => {
            const relevantBox = boxes.find(
                (box) => box.id === this.activity.dfgId,
            );

            if (relevantBox) {
                this.boundaryX1 =
                    relevantBox!.x -
                    relevantBox!.width / 2 +
                    environment.drawingElements.activities.width / 2;
                this.boundaryX2 =
                    this.boundaryX1 +
                    relevantBox!.width -
                    environment.drawingElements.activities.width;
                this.boundaryY1 =
                    relevantBox!.y -
                    relevantBox!.height / 2 +
                    environment.drawingElements.activities.height / 2;
                this.boundaryY2 =
                    this.boundaryY1 +
                    relevantBox!.height -
                    environment.drawingElements.activities.height;

                if (
                    this.xCoordinateInBox === 0 &&
                    this.yCoordinateInBox === 0
                ) {
                    this.xCoordinateInBox = Math.abs(
                        this.boundaryX1 - this.activity.x,
                    );
                    this.yCoordinateInBox = Math.abs(
                        this.boundaryY1 - this.activity.y,
                    );
                }
            }
        });

        this._dragAndDropService.getTransforms().subscribe((transforms) => {
            const transformData = transforms.get(
                `${this.activity.dfgId}_${this.activity.id}`,
            );

            if (transformData) {
                this.transform = transformData.transform;
            } else {
                this.transform = `translate(${this.activity.x}, ${this.activity.y})`;
            }
        });

        this._dragAndDropService.getTransformBox$.subscribe((transformBox) => {
            if (this.showEventLogs === false) {
                const updatedBox = transformBox.value;
                this._collectSelectedElementsService.resetSelectedArcs();

                const box = transformBox.map.get(this.activity.dfgId);

                if (box && this.activity.dfgId == updatedBox) {
                    this.translateX = box.x;
                    this.translateY = box.y;

                    let newY = this.startY + this.translateY;
                    let newX = this.startX + this.translateX;

                    newX = Math.max(
                        this.xCoordinateInBox +
                            environment.drawingElements.boxes.strokeWidth +
                            environment.drawingElements.activities.width / 2,
                        Math.min(newX, this.boundaryX2),
                    );
                    newY = Math.max(
                        this.yCoordinateInBox +
                            environment.drawingElements.boxes.strokeWidth +
                            environment.drawingElements.activities.height / 2,
                        Math.min(newY, this.boundaryY2),
                    );

                    const newTransform = `translate(${newX}, ${newY})`;

                    this._dragAndDropService.updatePosition(
                        `${this.activity.dfgId}_${this.activity.id}`,
                        newTransform,
                        newX,
                        newY,
                    );

                    this.positionChanged.emit({
                        x: newX,
                        y: newY,
                        xtl: 0,
                        ytl: 0,
                    });
                }
            }

            if (this.showEventLogs === true) {
                this.showEventLogs = false;
            }
        });
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        if (event.button === 0) {
            this.dragging = true;
        }
        this.offsetX = event.clientX - this.activity.x;
        this.offsetY = event.clientY - this.activity.y;

        this.mousePositionInitial = [event.clientX, event.clientY];
        this.mousePositionCurrent = [event.clientX, event.clientY];

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove = (event: MouseEvent) => {
        if (!this.dragging) return;

        this.mousePositionCurrent = [event.clientX, event.clientY];

        let newX = event.clientX - this.offsetX;
        let newY = event.clientY - this.offsetY;

        newX = Math.max(this.boundaryX1, Math.min(newX, this.boundaryX2));
        newY = Math.max(this.boundaryY1, Math.min(newY, this.boundaryY2));

        const newTransform = `translate(${newX}, ${newY})`;

        this._dragAndDropService.updatePosition(
            `${this.activity.dfgId}_${this.activity.id}`,
            newTransform,
            newX,
            newY,
        );

        this.positionChanged.emit({ x: newX, y: newY, xtl: 0, ytl: 0 });
    };

    @HostListener('document:mouseup')
    onMouseUp = () => {
        this.startX = this.activity.x;
        this.startY = this.activity.y;

        this.xCoordinateInBox = Math.abs(this.boundaryX1 - this.activity.x);
        this.yCoordinateInBox = Math.abs(this.boundaryY1 - this.activity.y);

        if (this.dragging) {
            if (
                this.mousePositionCurrent[0] !== this.mousePositionInitial[0] &&
                this.mousePositionCurrent[1] !== this.mousePositionInitial[1]
            ) {
                this._collectSelectedElementsService.resetSelectedArcs();
            } else {
                const rects = document.getElementsByTagName('svg')[0];
                const rect = rects.getElementById(
                    `${this.activity.dfgId}_${this.activity.id}`,
                ) as SVGRectElement;
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
                    this.activity.id,
                );
            }
        }

        this.dragging = false;

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    };
}
