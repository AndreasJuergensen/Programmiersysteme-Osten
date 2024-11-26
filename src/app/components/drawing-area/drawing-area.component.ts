import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Activity, Edge, Place, Transition } from './models';
import { CalculateCoordinatesService } from 'src/app/services/calculate-coordinates.service';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnInit, OnDestroy {
    private _activities: Array<Activity> = new Array<Activity>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _arcs: Array<Arc> = new Array<Arc>();

    constructor(
        private calculateCoordiantesService: CalculateCoordinatesService,
    ) {}

    get activities(): Array<Activity> {
        return this._activities;
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    get places(): Array<Place> {
        return this._places;
    }

    get arcs(): Array<Edge> {
        return this._edges;
    }

    ngOnInit(): void {
        // Subcribe to Observable from service which calculates coordinates...
        this.calculateCoordiantesService.graph$.subscribe((graph) => {
            const nodes: Array<Activity> = graph.nodes.map((node) => {
                return { id: node.id, coordinates: { x: node.x, y: node.y } };
            });

            const arcs: Array<Arc> = [];
            graph.edges.forEach((edge) => {
                const startNode: Activity = nodes.find(
                    (node) => edge.source.id === node.id,
                )!;
                const endNode: Activity = nodes.find(
                    (node) => edge.target.id === node.id,
                )!;

                arcs.push({ start: startNode, end: endNode });
            });

            this._activities = nodes;
            this._arcs = arcs;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from Observable subscriptions...
    }
}
