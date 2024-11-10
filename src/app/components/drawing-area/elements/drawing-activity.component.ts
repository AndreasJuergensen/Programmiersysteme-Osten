import { Component, Input } from '@angular/core';
import { Activity } from './elements';

@Component({
    selector: 'svg:g[app-drawing-activity]',
    template: `
        <svg:rect
            [attr.x]="activity.coordinates.x - 10"
            [attr.y]="activity.coordinates.y - 10"
        />
        <svg:text
            [attr.x]="activity.coordinates.x - 10"
            [attr.y]="activity.coordinates.y + 25"
        >
            {{ activity.id }}
        </svg:text>
    `,
    styles: `
        rect {
            height: 20px;
            width: 20px;
        }
    `,
})
export class DrawingActivityComponent {
    @Input({ required: true }) activity!: Activity;
}
