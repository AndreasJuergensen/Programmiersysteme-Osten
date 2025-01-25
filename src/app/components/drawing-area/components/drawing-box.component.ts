import { Component, Input } from '@angular/core';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import { environment } from 'src/environments/environment';
import { Box } from '../models';

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
            (click)="onBoxClick($event, box)"
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
    `,
})
export class DrawingBoxComponent {
    @Input({ required: true }) box!: Box;
    @Input({ required: true }) showEventLogs!: boolean;

    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
    ) {}

    readonly bgColor: string = environment.drawingElements.boxes.bgColor;
    readonly bgOpacity: string = environment.drawingElements.boxes.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.boxes.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.boxes.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.boxes.strokeWidth;

    onBoxClick(event: Event, box: Box) {
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
    }
}
