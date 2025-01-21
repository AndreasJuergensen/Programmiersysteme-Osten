import { Component, Input } from '@angular/core';
import { Activity } from '../models';
import { environment } from 'src/environments/environment';
import { FallThroughHandlingService } from 'src/app/services/fall-through-handling.service';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';

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
            (click)="onActivityClick($event, activity)"
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
    `,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;

    constructor(
        private _collectSelectedElementsService: CollectSelectedElementsService,
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
}
