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
            (mouseenter)="setHover()"
            (mouseleave)="unsetHover()"
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

    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';

    private startX = 0;
    private startY = 0;

    private boundaryX1: number = 0;
    private boundaryX2: number = 0;
    private boundaryY1: number = 0;
    private boundaryY2: number = 0;

    private mousePositionCurrent: [number, number] = [0, 0];
    private mousePositionInitial: [number, number] = [0, 0];

    private isHovering = false;

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

    setHover() {
        this.isHovering = true;
    }
    unsetHover() {
        this.isHovering = false;
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
        this.mousePositionCurrent = [event.clientX, event.clientY];

        if (this.showEventLogs) return;
        if (!this.dragging) return;

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
                this.mousePositionCurrent[1] === this.mousePositionInitial[1] &&
                this.isHovering === true
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
}
