import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';
import { environment } from 'src/environments/environment';
import { Activity, Box } from '../models';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';
import { BoxNode } from 'src/app/classes/graph';

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
            [classList]="'draggable confine'"
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
        .draggable {
            cursor: move;
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

    private _sub: Subscription | undefined;

    elementSelected: any;
    offset: any;
    //transform: any;
    mousePositionInitial: [number, number] = [0, 0];
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

    //NEU
    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';
    startX = 0;
    startY = 0;
    translateX = 0;
    translateY = 0;

    relevantBox: any;

    private xCoordinateInBox = 0;
    private yCoordinateInBox = 0;
    private mousePositionCurrent: [number, number] = [0, 0];
    //---

    //---------NEU---------
    ngOnInit() {
        this.startX = this.activity.x;
        this.startY = this.activity.y;

        this._sub = this._positionForActivitiesService.boxDimensions$.subscribe(
            (boxes) => {
                const relevantBox = boxes.find(
                    (box) => box.id === this.activity.dfgId,
                );

                this.relevantBox = relevantBox;

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
            },
        );

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

                this.positionChanged.emit({ x: newX, y: newY, xtl: 0, ytl: 0 });
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
        // this.mouseClicked = true;
        this.mousePositionInitial = [event.clientX, event.clientY];
        this.mousePositionCurrent = [event.clientX, event.clientY];

        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        //this.setBoundary(svg);

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

    //---------ALT---------
    // ngOnInit(): void {

    //     this._sub = this._positionForActivitiesService.boxDimensions$.subscribe(
    //         (boxes) => {
    //             const relevantBox = boxes.find(
    //                 (box) => box.id === this.activity.dfgId,
    //             );

    //             if (relevantBox) {
    //                 this.boundaryX1 = relevantBox!.x - relevantBox!.width / 2;
    //                 this.boundaryX2 = this.boundaryX1 + relevantBox!.width;
    //                 this.boundaryY1 = relevantBox!.y - relevantBox!.height / 2;
    //                 this.boundaryY2 = this.boundaryY1 + relevantBox!.height;
    //             }
    //         },
    //     );
    // }
    // startDrag(event: MouseEvent) {
    //     const svg: SVGSVGElement = document.getElementsByTagName(
    //         'svg',
    //     )[0] as SVGSVGElement;
    //     const target = event.target as SVGRectElement;
    //     this.mouseClicked = true;
    //     this.mousePositionInitial = [event.clientX, event.clientY];

    //     if (target.classList.contains('draggable')) {
    //         this.offset = this.getMousePosition(event);
    //         this.elementSelected = target;

    //         const transforms = this.elementSelected.transform.baseVal;

    //         if (target.classList.contains('confine')) {
    //             this.bbox = target.getBBox();
    //             this.minX = this.boundaryX1 - this.bbox.x;
    //             this.maxX = this.boundaryX2 - this.bbox.x - this.bbox.width;
    //             this.minY = this.boundaryY1 - this.bbox.y;
    //             this.maxY = this.boundaryY2 - this.bbox.y - this.bbox.height;
    //         }

    //         if (
    //             transforms.length === 0 ||
    //             transforms.getItem(0).type !==
    //                 SVGTransform.SVG_TRANSFORM_TRANSLATE
    //         ) {
    //             const translate = svg.createSVGTransform();
    //             translate.setTranslate(0, 0);

    //             this.elementSelected.transform.baseVal.insertItemBefore(
    //                 translate,
    //                 0,
    //             );
    //         }

    //         this.transform = transforms.getItem(0);
    //         this.offset.x -= this.transform.matrix.e;
    //         this.offset.y -= this.transform.matrix.f;
    //     }
    // }

    // drag(event: MouseEvent) {
    //     const target = event.target as SVGRectElement;
    //     if (this.elementSelected !== null && this.mouseClicked === true) {
    //         event.preventDefault();
    //         const coord = this.getMousePosition(event);

    //         if (this.transform !== undefined) {
    //             let dx = coord.x - this.offset.x;
    //             let dy = coord.y - this.offset.y;

    //             if (target.classList.contains('confine')) {
    //                 if (dx < this.minX) {
    //                     dx = this.minX;
    //                 } else if (dx > this.maxX) {
    //                     dx = this.maxX;
    //                 }

    //                 if (dy < this.minY) {
    //                     dy = this.minY;
    //                 } else if (dy > this.maxY) {
    //                     dy = this.maxY;
    //                 }
    //             }

    //             this._positionForActivitiesService.updateActivityPosition(
    //                 this.activity.id,
    //                 this.activity.dfgId,
    //                 dx,
    //                 dy,
    //             );
    //         }
    //     }
    // }

    // endDrag(event: MouseEvent, activity: Activity) {
    //     this.elementSelected = null;
    //     const mousePositionCurrent = [event.clientX, event.clientY];
    //     if (this.mouseClicked) {
    //         if (
    //             mousePositionCurrent[0] !== this.mousePositionInitial[0] &&
    //             mousePositionCurrent[1] !== this.mousePositionInitial[1]
    //         ) {
    //             this._positionForActivitiesService.updateCoordinatesOfBoxArcs(
    //                 this.activity.id,
    //                 this.activity.dfgId,
    //                 this.activity.x,
    //                 this.activity.y,
    //             );
    //             this.mouseClicked = false;
    //             this._collectSelectedElementsService.resetSelectedArcs();
    //         } else {
    //             const rect = event.target as SVGRectElement;
    //             const svg: SVGSVGElement = document.getElementsByTagName(
    //                 'svg',
    //             )[0] as SVGSVGElement;
    //             if (svg) {
    //                 const activities = svg.querySelectorAll('rect');
    //                 activities.forEach((activity) => {
    //                     if (rect === activity) {
    //                         rect.classList.toggle('activity-marked');
    //                     } else {
    //                         activity.classList.remove('activity-marked');
    //                     }
    //                 });
    //             }
    //             this._collectSelectedElementsService.updateSelectedActivity(
    //                 activity.id,
    //             );
    //             this.mouseClicked = false;
    //         }
    //     }
    // }

    // private getMousePosition(event: MouseEvent) {
    //     const svg: SVGSVGElement = document.getElementsByTagName(
    //         'svg',
    //     )[0] as SVGSVGElement;
    //     var CTM = svg.getScreenCTM();

    //     if (!CTM) {
    //         throw new Error('CTM is null');
    //     }

    //     return {
    //         x: (event.clientX - CTM.e) / CTM.a,
    //         y: (event.clientY - CTM.f) / CTM.d,
    //     };
    // }
}
