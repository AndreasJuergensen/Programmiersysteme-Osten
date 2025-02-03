import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Transition } from '../models';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';

@Component({
    selector: 'svg:g[app-drawing-transition]',
    template: `
        <svg:rect
            [attr.x]="transition.x - width / 2"
            [attr.y]="transition.y - height / 2"
            [attr.height]="height"
            [attr.width]="width"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="transition.x - transition.name.length * 3.8"
            [attr.y]="transition.y + (height + strokeWidth) / 2 + 20"
            [attr.font-size]="13"
        >
            {{ transition.name }}
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
export class DrawingTransitionComponent {
    @Input({ required: true }) transition!: Transition;
    //@Output() positionChanged = new EventEmitter<{ x: number; y: number }>();
    @Output() positionChanged = new EventEmitter<{
        x: number;
        y: number;
        xtl: number;
        ytl: number;
    }>();

    constructor(private _dragAndDropService: DragAndDropService) {}

    readonly height: number = environment.drawingElements.transitions.height;
    readonly width: number = environment.drawingElements.transitions.height;

    readonly bgColor: string = environment.drawingElements.transitions.bgColor;
    readonly bgOpacity: string =
        environment.drawingElements.transitions.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.transitions.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.transitions.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.transitions.strokeWidth;

    private dragging = false;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';

    private boundaryX1: number =
        environment.drawingElements.transitions.width / 2 +
        environment.drawingElements.transitions.strokeWidth;
    private boundaryX2: number = 0;
    private boundaryY1: number =
        environment.drawingElements.transitions.height / 2 +
        environment.drawingElements.transitions.strokeWidth;
    private boundaryY2: number = 0;

    ngOnInit() {
        this._dragAndDropService.getTransforms().subscribe((transforms) => {
            const transformData = transforms.get(this.transition.id);

            if (transformData) {
                this.transform = transformData.transform;
            } else {
                this.transform = `translate(${this.transition.x}, ${this.transition.y})`;
            }
        });
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.dragging = true;
        this.offsetX = event.clientX - this.transition.x;
        this.offsetY = event.clientY - this.transition.y;

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
            this.transition.id,
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
