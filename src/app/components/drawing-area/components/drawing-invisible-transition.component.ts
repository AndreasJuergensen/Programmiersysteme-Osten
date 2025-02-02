import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { Transition } from '../models';
import { environment } from 'src/environments/environment';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';
import { env } from 'process';

@Component({
    selector: 'svg:g[app-drawing-invisible-transition]',
    template: `
        <svg:rect
            [attr.x]="invisibleTransition.x - width / 2"
            [attr.y]="invisibleTransition.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="invisibleTransition.x"
            [attr.y]="invisibleTransition.y + (height + strokeWidth) / 2 + 20"
        >
            {{ invisibleTransition.name }}
        </svg:text>
    `,
    styles: `
        rect:hover {
            cursor: move;
        }
        :host {
            will-change: transform;
        }
    `,
})
export class DrawingInvisibleTransitionComponent {
    @Input({ required: true }) invisibleTransition!: Transition;
    //@Output() positionChanged = new EventEmitter<{ x: number; y: number }>();
    @Output() positionChanged = new EventEmitter<{
        x: number;
        y: number;
        xtl: number;
        ytl: number;
    }>();

    constructor(private _dragAndDropService: DragAndDropService) {}

    readonly height: number =
        environment.drawingElements.invisibleTransitions.height;
    readonly width: number =
        environment.drawingElements.invisibleTransitions.width;

    readonly bgColor: string =
        environment.drawingElements.invisibleTransitions.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.invisibleTransitions.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.invisibleTransitions.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.invisibleTransitions.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.invisibleTransitions.strokeWidth;

    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';

    private boundaryX1: number =
        environment.drawingElements.invisibleTransitions.width / 2 +
        environment.drawingElements.invisibleTransitions.strokeWidth;
    private boundaryX2: number = 0;
    private boundaryY1: number =
        environment.drawingElements.invisibleTransitions.height / 2 +
        environment.drawingElements.invisibleTransitions.strokeWidth;
    private boundaryY2: number = 0;

    ngOnInit() {
        this._dragAndDropService.getTransforms().subscribe((transforms) => {
            const transformData = transforms.get(this.invisibleTransition.id);

            if (transformData) {
                this.transform = transformData.transform;
            } else {
                this.transform = `translate(${this.invisibleTransition.x}, ${this.invisibleTransition.y})`;
            }
        });
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.dragging = true;
        this.offsetX = event.clientX - this.invisibleTransition.x;
        this.offsetY = event.clientY - this.invisibleTransition.y;

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

        let newX = event.clientX - this.offsetX;
        let newY = event.clientY - this.offsetY;

        newX = Math.max(this.boundaryX1, Math.min(newX, this.boundaryX2));
        newY = Math.max(this.boundaryY1, Math.min(newY, this.boundaryY2));

        const newTransform = `translate(${newX}, ${newY})`;

        this._dragAndDropService.updatePosition(
            this.invisibleTransition.id,
            newTransform,
            newX,
            newY,
        );

        this.positionChanged.emit({ x: newX, y: newY, xtl: 0, ytl: 0 });
    };

    @HostListener('document:mouseup')
    onMouseUp = () => {
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
