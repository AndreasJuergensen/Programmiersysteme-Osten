import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DrawingService } from './drawing.service';
import { SvgService } from './svg.service';
import { Diagram } from './models';
import { Graph } from 'src/app/classes/graph';

@Component({
    selector: 'app-drawing-area',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnDestroy {
    private readonly _subs: Set<Subscription> = new Set<Subscription>();

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    constructor(
        private readonly drawingService: DrawingService,
        private readonly svgService: SvgService,
    ) {
        this._subs.add(
            this.drawingService.diagram$.subscribe((diagram) =>
                this.draw(diagram),
            ),
        );

        this._subs.add(
            this.drawingService.graph$.subscribe((graph) =>
                this.drawGraph(graph),
            ),
        );
    }

    ngOnDestroy(): void {
        this._subs.forEach((s) => s.unsubscribe());
    }

    private draw(diagram: Diagram): void {
        if (this.drawingArea === undefined) {
            return;
        }

        this.clearDrawingArea();
        const svgElements: Array<SVGElement> =
            this.svgService.createSvgElements(diagram);

        svgElements.forEach((svgElement) =>
            this.drawingArea?.nativeElement.appendChild(svgElement),
        );
    }

    private drawGraph(graph: Graph): void {
        if (this.drawingArea === undefined) {
            return;
        }

        this.clearDrawingArea();
        const svgElements: Array<SVGElement> =
            this.svgService.createSvgElements2(graph);

        svgElements.forEach((svgElement) =>
            this.drawingArea?.nativeElement.appendChild(svgElement),
        );
    }

    private clearDrawingArea(): void {
        const area: SVGElement | undefined = this.drawingArea?.nativeElement;
        if (area?.childElementCount === undefined) {
            return;
        }

        while (area.childElementCount > 0) {
            area.removeChild(area.lastChild as ChildNode);
        }
    }
}
