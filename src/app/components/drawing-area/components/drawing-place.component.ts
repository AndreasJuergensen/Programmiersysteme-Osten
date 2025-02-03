import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Place } from '../models';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';

@Component({
    selector: 'svg:g[app-drawing-place]',
    template: `
        <!--
        Using ellipse to draw a circle. A bug prevents setting background for
        circle element.
        -->
        <svg:ellipse
            [attr.cx]="place.x"
            [attr.cy]="place.y"
            [attr.rx]="radius"
            [attr.ry]="radius"
            [attr.fill]="bgColor"
            [attr.fill-opacity]="bgOpacity"
            [attr.stroke]="strokeColor"
            [attr.stroke-opacity]="strokeOpacity"
            [attr.stroke-width]="strokeWidth"
        />
        <svg:text
            [attr.x]="place.x - place.id.length * 3.8"
            [attr.y]="place.y + radius + strokeWidth / 2 + 20"
            [attr.font-size]="13"
        >
            {{ place.id }}
        </svg:text>
    `,
    styles: `
        circle {
            fill: black;
        }
        ellipse:hover {
            cursor: move;
        }
        :host {
            will-change: transform;
        }
    `,
})
export class DrawingPlaceComponent {
    @Input({ required: true }) place!: Place;
    // @Output() positionChanged = new EventEmitter<{
    //     x: number;
    //     y: number;
    // }>();
    @Output() positionChanged = new EventEmitter<{
        x: number;
        y: number;
        xtl: number;
        ytl: number;
    }>();

    constructor(private _dragAndDropService: DragAndDropService) {}

    readonly radius: number = environment.drawingElements.places.radius;

    readonly bgColor: string = environment.drawingElements.places.bgColor;
    readonly bgOpacity: string = environment.drawingElements.places.bgOpacity;

    readonly strokeColor: string =
        environment.drawingElements.places.strokeColor;
    readonly strokeOpacity: string =
        environment.drawingElements.places.strokeOpacity;
    readonly strokeWidth: number =
        environment.drawingElements.places.strokeWidth;

    private dragging = false;
    private startX = 0;
    private startY = 0;
    private offsetX = 0;
    private offsetY = 0;
    private transform = '';

    private boundaryX1: number =
        environment.drawingElements.places.radius +
        environment.drawingElements.places.strokeWidth;
    private boundaryX2: number = 0;
    private boundaryY1: number =
        environment.drawingElements.places.radius +
        environment.drawingElements.places.strokeWidth;
    private boundaryY2: number = 0;

    ngOnInit() {
        this._dragAndDropService.getTransforms().subscribe((transforms) => {
            const transformData = transforms.get(this.place.id);

            if (transformData) {
                this.transform = transformData.transform;
            } else {
                this.transform = `translate(${this.place.x}, ${this.place.y})`;
            }
        });
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.dragging = true;
        this.offsetX = event.clientX - this.place.x;
        this.offsetY = event.clientY - this.place.y;
        this.startX = event.clientX;
        this.startY = event.clientY;

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
            this.place.id,
            newTransform,
            newX,
            newY,
        );

        let deltaX = event.clientX - this.startX;
        let deltaY = event.clientY - this.startY;

        this.positionChanged.emit({
            x: newX,
            y: newY,
            xtl: deltaX,
            ytl: deltaY,
        });
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
