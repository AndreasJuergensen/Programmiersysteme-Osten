import { Component, Input } from '@angular/core';
import { Arc } from '../models';
import { environment } from 'src/environments/environment';
import { CollectArcsService } from 'src/app/services/collect-arcs.service';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';

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
                    [attr.fill]="color"
                    [attr.stroke]="color"
                    [attr.stroke-width]="width"
                ></svg:path>
            </svg:marker>
            <svg:marker
                id="arrowhead-red"
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

        <svg:path
            [attr.d]="pathForLine(arc)"
            [attr.stroke-width]="10"
            [attr.fill]="'none'"
            fill="transparent"
            pointer-events="all"
            (pointerenter)="changeLineColorOver($event, arc)"
            (pointerleave)="changeLineColorOut($event)"
            (click)="onLineClick($event, arc)"
        ></svg:path>
        <svg:path
            [attr.class]="'visiblePath'"
            [attr.d]="pathForLine(arc)"
            [attr.stroke]="'black'"
            [attr.stroke-width]="width"
            [attr.fill]="'none'"
            marker-end="url(#arrowhead)"
        ></svg:path>
    `,
    styles: `
        path:hover {
            cursor: pointer;
        }

        path.active {
            stroke: red !important;
        }

        path.hovered {
            stroke: red !important;
        }
    `,
})
export class DrawingArcComponent {
    @Input({ required: true }) arc!: Arc;
    // private hoverTimeout: any;

    constructor(
        private collectArcsService: CollectArcsService,
        private feedbackService: ShowFeedbackService,
    ) {}

    readonly width: number = environment.drawingElements.arcs.width;
    readonly color: string = environment.drawingElements.arcs.color;
    // readonly svg: SVGSVGElement = document.getElementsByTagName(
    //     'svg',
    // )[0] as SVGSVGElement;
    private isMouseEntering = false;
    private timeoutId: any;

    changeLineColorOver(event: Event, arc: Arc): void {
        // console.log('HoverIn');
        // clearTimeout(this.hoverTimeout);
        // this.hoverTimeout = setTimeout(() => {
        // const rect: SVGRectElement = event.target as SVGRectElement;
        // const line = rect.nextElementSibling as SVGLineElement;
        const pathDummy = event.target as SVGPathElement;
        const path = pathDummy.nextElementSibling as SVGLineElement;
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId); // Lösche den alten Timeout
        }

        // if (this.isMouseEntering) {
        //     return; // Wenn die Maus bereits darüber ist, tue nichts
        // }

        // this.isMouseEntering = true;

        if (svg && path) {
            console.log('HoverIn');
            if (
                !svg.classList.contains('mouseDown') &&
                !path.classList.contains('active')
            ) {
                path.classList.add('hovered');
                path.setAttribute('marker-end', 'url(#arrowhead-red)');
            } else if (svg.classList.contains('mouseDown')) {
                this.timeoutId = setTimeout(() => {
                    if (!path.classList.contains('active')) {
                        path.classList.toggle('active');
                        path.setAttribute('marker-end', 'url(#arrowhead-red)');
                    } else {
                        path.classList.toggle('active');
                        path.setAttribute('marker-end', 'url(#arrowhead)');
                    }
                }, 90);
            }
        }

        // if (path && !path.classList.contains('active')) {
        //     path.classList.add('hovered');
        //     path.setAttribute('marker-end', 'url(#arrowhead-red)');
        // }

        // if (
        //     path &&
        //     svg.classList.contains('mouseDown') &&
        //     !path.classList.contains('active')
        // ) {
        //     console.log(path.classList);

        //     if (this.collectArcsService.isDFGArc(arc)) {
        //         if (this.collectArcsService.isArcinSameDFG(arc)) {
        //             if (path) {
        //                 path.classList.toggle('active');
        //             }

        //             this.collectArcsService.updateCollectedArcs(arc);
        //         } else {
        //             this.feedbackService.showMessage(
        //                 'Arc not in same DFG',
        //                 true,
        //             );
        //         }
        //     } else {
        //         this.feedbackService.showMessage('Arc is not a DFGArc', true);
        //     }
        // } else if (
        //     path &&
        //     svg.classList.contains('mouseDown') &&
        //     path.classList.contains('active')
        // ) {
        //     // if (this.collectArcsService.isDFGArc(arc)) {
        //     //     if (this.collectArcsService.isArcinSameDFG(arc)) {
        //     if (path) {
        //         path.classList.toggle('active');
        //     }

        //     //     this.collectArcsService.updateCollectedArcs(arc);
        //     // } else {
        //     //     this.feedbackService.showMessage(
        //     //         'Arc not in same DFG',
        //     //         true,
        //     //     );
        //     // }
        //     // } else {
        //     //     this.feedbackService.showMessage('Arc is not a DFGArc', true);
        //     // }
        // }
        // // }, 10);
    }
    changeLineColorOut(event: Event): void {
        // clearTimeout(this.hoverTimeout);
        // this.hoverTimeout = setTimeout(() => {
        // console.log('HoverOut');
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg && !svg.classList.contains('mouseDown')) {
            console.log('HoverOut');
            const rect = event.target as SVGRectElement;
            const line = rect.nextElementSibling as SVGLineElement;

            if (line && !line.classList.contains('active')) {
                line.classList.remove('hovered');
                line.setAttribute('marker-end', 'url(#arrowhead)');
            }
            // }, 2);
        }
    }

    onLineClick(event: Event, arc: Arc): void {
        const rect = event.target as SVGRectElement;
        const line = rect.nextElementSibling as SVGLineElement;

        if (this.collectArcsService.isDFGArc(arc)) {
            if (this.collectArcsService.isArcinSameDFG(arc)) {
                if (line) {
                    line.classList.toggle('active');
                }

                this.collectArcsService.updateCollectedArcs(arc);
            } else {
                this.feedbackService.showMessage('Arc not in same DFG', true);
            }
        } else {
            this.feedbackService.showMessage('Arc is not a DFGArc', true);
        }
    }

    rectheight = 10;

    rectWidth(arc: Arc): number {
        const width = Math.sqrt(
            Math.pow(this.arc.x2 - this.arc.x1, 2) +
                Math.pow(this.arc.y2 - this.arc.y1, 2),
        );

        return width;
    }

    get rotationAngle(): number {
        return (
            Math.atan2(this.arc.y2 - this.arc.y1, this.arc.x2 - this.arc.x1) *
            (180 / Math.PI)
        );
    }

    pathForLine(arc: Arc): string {
        if (!this.pathNecessary(arc)) {
            return `M ${arc.x1} ${arc.y1} L ${arc.x2} ${arc.y2}`;
        }

        let controlPointX = (arc.x1 + arc.x2) / 2;
        let controlPointY = Math.min(arc.start.y, arc.end.y);

        if (arc.start.y > arc.end.y) {
            controlPointY = Math.min(arc.start.y, arc.end.y) + 100;
        }

        if (arc.start.y === arc.end.y) {
            if (arc.start.x > arc.end.x) {
                controlPointY = Math.min(arc.start.y, arc.end.y) - 30;
            }
            if (arc.start.x <= arc.end.x) {
                controlPointY = Math.min(arc.start.y, arc.end.y) + 30;
            }
        }

        return `M ${arc.x1} ${arc.y1} Q ${controlPointX} ${controlPointY} ${arc.x2} ${arc.y2}`;
    }

    private pathNecessary(arc: Arc): boolean {
        return this.collectArcsService.overlayArcsExistsInDFGs(arc);
    }
}
