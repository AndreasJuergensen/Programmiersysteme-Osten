import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { environment } from 'src/environments/environment';
import { Box } from '../models';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';

@Component({
    selector: 'svg:g[app-drawing-box]',
    template: `
        <svg:rect
            [attr.id]="box.id"
            [attr.x]="box.x - box.width / 2"
            [attr.y]="box.y - box.height / 2"
            [attr.height]="box.height"
            [attr.width]="box.width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
            pointer-events="stroke"
            [classList]="'draggable confine'"
        />
        <svg:text
            [attr.x]="box.x - box.id.length * 3.8"
            [attr.y]="box.y + (box.height + strokeWidth) / 2 + 20"
            [attr.font-size]="13"
        >
            {{ box.id }}
        </svg:text>
        <ng-container *ngIf="showEventLogs">
            <foreignObject
                [attr.x]="box.x - box.width / 2"
                [attr.y]="box.y - box.height / 2"
                [attr.width]="box.width"
                [attr.height]="box.height"
                [attr.overflow-y]="'auto'"
            >
                <div class="event-log">
                    {{ box.eventLog }}
                </div>
            </foreignObject>
        </ng-container>
    `,
    styles: `
        rect:hover {
            cursor: pointer;
            stroke-width: 5;
            stroke-opacity: 0.5;
        }
        rect.box-marked {
            stroke: #d42f7c;
            stroke-width: 5;
        }
        .event-log {
            height: 100%;
            width: 100%;
            overflow-y: auto;
            padding: 10px;
            box-sizing: border-box;
            white-space: pre-line;
            user-select: text;
            &::selection {
                color: #d42f7c;
                background-color: #efc9db;
            }
        }
        :host {
            will-change: transform;
        }
    `,
})
export class DrawingBoxComponent {
    @Input({ required: true }) box!: Box;
    @Input({ required: true }) showEventLogs!: boolean;
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

    readonly bgColor: string = environment.drawingElements.boxes.bgColor;
    readonly bgOpacity: string = environment.drawingElements.boxes.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.boxes.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.boxes.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.boxes.strokeWidth;

    elementSelected: any;
    offset: any;
    mousePositionInitial: [number, number] = [0, 0];
    mouseClicked: boolean = false;

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

    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';

    private startX = 0;
    private startY = 0;
    translateX = 0;
    translateY = 0;
    private lastX = 0;
    private lastY = 0;
    private lastDeltaX = 0;
    private lastDeltaY = 0;
    private mousePositionCurrent: [number, number] = [0, 0];

    //----------NEU----------

    ngOnInit() {
        this.boundaryX1 =
            this.box.width / 2 + environment.drawingElements.boxes.strokeWidth;
        this.boundaryY1 =
            this.box.height / 2 + environment.drawingElements.boxes.strokeWidth;

        this._dragAndDropService.getTransforms().subscribe((transforms) => {
            const transformData = transforms.get(this.box.id);

            if (transformData) {
                this.transform = transformData.transform;
            } else {
                this.transform = `translate(${this.box.x}, ${this.box.y})`;
            }
        });
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        if (event.button === 0) {
            this.dragging = true;
        }

        this.offsetX = event.clientX - this.box.x;
        this.offsetY = event.clientY - this.box.y;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.mousePositionInitial = [event.clientX, event.clientY];
        this.mousePositionCurrent = [event.clientX, event.clientY];

        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        this.setBoundary(svg);

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove = (event: MouseEvent) => {
        if (!this.dragging) return;

        this.mousePositionCurrent = [event.clientX, event.clientY];

        const x = event.clientX - this.offsetX;
        const y = event.clientY - this.offsetY;

        let deltaX = event.clientX - this.startX;
        let deltaY = event.clientY - this.startY;

        const newX = Math.max(this.boundaryX1, Math.min(x, this.boundaryX2));
        const newY = Math.max(this.boundaryY1, Math.min(y, this.boundaryY2));

        const newTransform = `translate(${newX}, ${newY})`;

        this._dragAndDropService.updatePosition(
            this.box.id,
            newTransform,
            newX,
            newY,
        );

        this._dragAndDropService.updateBoxPosition(this.box.id, deltaX, deltaY);

        this.positionChanged.emit({
            x: newX,
            y: newY,
            xtl: deltaX,
            ytl: deltaY,
        });
    };

    @HostListener('document:mouseup')
    onMouseUp = () => {
        if (this.dragging) {
            if (
                this.mousePositionCurrent[0] === this.mousePositionInitial[0] &&
                this.mousePositionCurrent[1] === this.mousePositionInitial[1]
            ) {
                const rects = document.getElementsByTagName('svg')[0];
                const rect = rects.getElementById(
                    `${this.box.id}`,
                ) as SVGRectElement;
                const svg: SVGSVGElement = document.getElementsByTagName(
                    'svg',
                )[0] as SVGSVGElement;

                if (svg) {
                    const boxes = svg.querySelectorAll('rect');
                    boxes.forEach((box) => {
                        if (rect === box) {
                            rect.classList.toggle('box-marked');
                        } else {
                            box.classList.remove('box-marked');
                        }
                    });
                    this._collectSelectedElementsService.updateSelectedDFG(
                        this.box.id,
                    );
                }
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

    //----------ALT----------

    // startDrag(event: MouseEvent) {
    //     const svg: SVGSVGElement = document.getElementsByTagName(
    //         'svg',
    //     )[0] as SVGSVGElement;
    //     const target = event.target as SVGRectElement;
    //     this.mouseClicked = true;
    //     this.mousePositionInitial = [event.clientX, event.clientY];

    //     this.setBoundary(svg);

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
    //             this.dx = coord.x - this.offset.x;
    //             this.dy = coord.y - this.offset.y;

    //             if (target.classList.contains('confine')) {
    //                 if (this.dx < this.minX) {
    //                     this.dx = this.minX;
    //                 } else if (this.dx > this.maxX) {
    //                     this.dx = this.maxX;
    //                 }

    //                 if (this.dy < this.minY) {
    //                     this.dy = this.minY;
    //                 } else if (this.dy > this.maxY) {
    //                     this.dy = this.maxY;
    //                 }
    //             }

    //             this._positionForActivitiesService.updateElementPosition(
    //                 this.box.id,
    //                 'box',
    //                 this.dx,
    //                 this.dy,
    //             );
    //         }
    //     }
    // }
    // endDrag(event: MouseEvent, box: Box) {
    //     this.elementSelected = null;
    //     const mousePositionCurrent = [event.clientX, event.clientY];

    //     if (this.mouseClicked) {
    //         if (
    //             mousePositionCurrent[0] !== this.mousePositionInitial[0] &&
    //             mousePositionCurrent[1] !== this.mousePositionInitial[1]
    //         ) {
    //             this._positionForActivitiesService.updateEndPositionOfElement(
    //                 this.box.id,
    //                 'box',
    //                 this.box.x,
    //                 this.box.y,
    //                 this.dx,
    //                 this.dy,
    //             );
    //             this.mouseClicked = false;
    //         } else {
    //             const rect = event.target as SVGRectElement;
    //             const svg: SVGSVGElement = document.getElementsByTagName(
    //                 'svg',
    //             )[0] as SVGSVGElement;
    //             if (svg) {
    //                 const boxes = svg.querySelectorAll('rect');
    //                 boxes.forEach((box) => {
    //                     if (rect === box) {
    //                         rect.classList.toggle('box-marked');
    //                     } else {
    //                         box.classList.remove('box-marked');
    //                     }
    //                 });
    //             }
    //             this._collectSelectedElementsService.updateSelectedDFG(box.id);
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

    // private setBoundary(svg: SVGSVGElement): void {
    //     const drawingArea = document.getElementById('drawingArea');
    //     if (drawingArea && svg) {
    //         const drawingAreaBox = drawingArea.getBoundingClientRect();
    //         const svgBox = svg.getBoundingClientRect();

    //         this.boundaryX2 = drawingAreaBox.width;
    //         this.boundaryY2 = drawingAreaBox.height;

    //         if (svgBox.width > drawingAreaBox.width) {
    //             this.boundaryX2 = svgBox.width;
    //         }

    //         if (svgBox.height > drawingAreaBox.height) {
    //             this.boundaryY2 = svgBox.height;
    //         }
    //     }
    // }
}
