import { Component, Input } from '@angular/core';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { environment } from 'src/environments/environment';
import { Box } from '../models';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';

@Component({
    selector: 'svg:g[app-drawing-box]',
    template: `
        <svg:rect
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
            (mousedown)="startDrag($event)"
            (mousemove)="drag($event)"
            (mouseup)="endDrag($event, box)"
            (mouseleave)="endDrag($event, box)"
        />
        <svg:text
            [attr.x]="box.x - box.id.length * 4.8"
            [attr.y]="box.y + (box.height + strokeWidth) / 2 + 20"
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
            stroke-width: 7;
            stroke: #085c5c;
        }
        rect.box-marked {
            stroke: #085c5c;
            stroke-width: 7;
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
        .draggable {
            cursor: move;
        }
    `,
})
export class DrawingBoxComponent {
    @Input({ required: true }) box!: Box;
    @Input({ required: true }) showEventLogs!: boolean;

    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
        private _positionForActivitiesService: PositionForActivitiesService,
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
    transform: any;
    mousePositionInitial: [number, number] = [0, 0];
    mouseClicked: boolean = false;

    dx: number = 0;
    dy: number = 0;

    // onBoxClick(event: Event, box: Box) {
    //     const rect = event.target as SVGRectElement;
    //     const svg: SVGSVGElement = document.getElementsByTagName(
    //         'svg',
    //     )[0] as SVGSVGElement;
    //     if (svg) {
    //         const boxes = svg.querySelectorAll('rect');
    //         boxes.forEach((box) => {
    //             if (rect === box) {
    //                 rect.classList.toggle('box-marked');
    //             } else {
    //                 box.classList.remove('box-marked');
    //             }
    //         });
    //     }
    //     this._collectSelectedElementsService.updateSelectedDFG(box.id);
    // }

    startDrag(event: MouseEvent) {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;
        const target = event.target as SVGRectElement;
        this.mouseClicked = true;
        this.mousePositionInitial = [event.clientX, event.clientY];

        if (target.classList.contains('draggable')) {
            this.offset = this.getMousePosition(event);
            this.elementSelected = target;

            const transforms = this.elementSelected.transform.baseVal;

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

                this._positionForActivitiesService.updateElementPosition(
                    this.box.id,
                    'box',
                    this.dx,
                    this.dy,
                );
            }
        }
    }
    endDrag(event: MouseEvent, box: Box) {
        this.elementSelected = null;
        const mousePositionCurrent = [event.clientX, event.clientY];

        if (this.mouseClicked) {
            if (
                mousePositionCurrent[0] !== this.mousePositionInitial[0] &&
                mousePositionCurrent[1] !== this.mousePositionInitial[1]
            ) {
                this._positionForActivitiesService.updateEndPositionOfElement(
                    this.box.id,
                    'box',
                    this.box.x,
                    this.box.y,
                    this.dx,
                    this.dy,
                );
                this.mouseClicked = false;
            } else {
                const rect = event.target as SVGRectElement;
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
                }
                this._collectSelectedElementsService.updateSelectedDFG(box.id);
                this.mouseClicked = false;
            }
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
