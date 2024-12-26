import { Component, Input } from '@angular/core';
import { Activity } from '../models';
import { environment } from 'src/environments/environment';
import { FallThroughHandlingService } from 'src/app/services/fall-through-handling.service';

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
            (click)="onActivityClick(activity)"
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
        }
    `,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;

    constructor(
        private _fallThroughHandlingService: FallThroughHandlingService,
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

    onActivityClick(activity: Activity): void {
        this._fallThroughHandlingService.processActivityClick(activity.id);
    }
}
