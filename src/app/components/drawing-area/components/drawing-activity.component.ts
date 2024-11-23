import { Component, Input } from '@angular/core';
import { Activity } from '../models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'svg:g[app-drawing-activity]',
    template: `
        <svg:rect
            [attr.x]="activity.coordinates.x - width / 2"
            [attr.y]="activity.coordinates.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
        />
        <svg:text
            [attr.x]="activity.coordinates.x"
            [attr.y]="activity.coordinates.y + height"
        >
            {{ activity.id }}
        </svg:text>
    `,
    styles: ``,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;

    readonly height: number = environment.drawingElements.activities.height;
    readonly width: number = environment.drawingElements.activities.height;
}
