import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';
import { CollectArcsService } from 'src/app/services/collect-arcs.service';

@Component({
    selector: 'svg:g[app-drawing-arc]',
    template: `
        <svg:defs>
            <svg:marker
                id="arrowhead"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="markerColor"
                    [attr.stroke]="markerColor"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
            <svg:marker
                [attr.id]="'arrowhead-hover' + arc.x1 + arc.y1"
                viewBox="0 0 10 10"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto-start-reverse"
            >
                <svg:path
                    d="M 1,1 L 9,5 L 1,9 Z"
                    [attr.fill]="'red'"
                    [attr.stroke]="'red'"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
        </svg:defs>

        <svg:rect
            [attr.x]="arc.x1"
            [attr.y]="arc.y1 - 5"
            [attr.width]="arc.x2 - arc.x1"
            [attr.height]="rectheight"
            fill="transparent"
            pointer-events="all"
            [attr.transform]="
                'rotate(' + rotationAngle + ',' + arc.x1 + ',' + arc.y1 + ')'
            "
            (mouseover)="changeLineColorOver('red')"
            (mouseout)="changeLineColorOut('black')"
            (click)="onLineClick(arc)"
        ></svg:rect>
        <svg:line
            [attr.x1]="arc.x1"
            [attr.y1]="arc.y1"
            [attr.x2]="arc.x2"
            [attr.y2]="arc.y2"
            [attr.stroke]="isActive ? 'red' : color"
            [attr.stroke-width]="width"
            [attr.marker-end]="'url(' + arrow + ')'"
            [attr.clicked]="isActive"
        />
    `,
    styles: `
        rect:hover {
            cursor: pointer;
            /* marker-end: url(arrow);*/
        }
    `,
})
export class DrawingArcComponent {
    @Input({ required: true }) arc!: Arc;

    constructor(private collectArcsService: CollectArcsService) {}

    readonly width: number = environment.drawingElements.arcs.width;
    color: string = environment.drawingElements.arcs.color;
    markerColor = environment.drawingElements.arcs.color;
    arrow = '#arrowhead';
    isActive = false;

    changeLineColorOver(color: string): void {
        this.color = color;
        this.arrow = '#arrowhead-hover' + this.arc.x1 + this.arc.y1;
    }
    changeLineColorOut(color: string): void {
        this.arrow = '#arrowhead';
        this.color = color;

        if (this.isActive === true) {
            this.markerColor = 'red';
        }

        console.log(this.markerColor);
    }

    onLineClick(arc: Arc): void {
        if (this.collectArcsService.isDFGArc(arc)) {
            console.log('Arc ist DFFGArc');

            if (this.collectArcsService.isArcinSameDFG(arc)) {
                console.log('Arc in same DFG');
                this.collectArcsService.updateCollectedArcs(arc);

                if (this.isActive === true) {
                    console.log('alte MarkerColor: ' + this.markerColor);
                    this.markerColor = environment.drawingElements.arcs.color;
                    console.log('neue MarkerColor: ' + this.markerColor);

                    this.isActive = false;
                } else {
                    console.log('alte MarkerColor: ' + this.markerColor);
                    this.markerColor = 'red';
                    console.log('neue MarkerColor: ' + this.markerColor);
                    this.isActive = true;
                }
            } else {
                console.log('Arc not in same DFG');
            }
        } else {
            console.log('Arc ist keine DFGArc');
        }
    }

    rectheight = 10;

    get rectWidth(): number {
        return Math.sqrt(
            Math.pow(this.arc.x2 - this.arc.x1, 2) +
                Math.pow(this.arc.y2 - this.arc.y1, 2),
        );
    }

    get rotationAngle(): number {
        return (
            Math.atan2(this.arc.y2 - this.arc.y1, this.arc.x2 - this.arc.x1) *
            (180 / Math.PI)
        );
    }
}
