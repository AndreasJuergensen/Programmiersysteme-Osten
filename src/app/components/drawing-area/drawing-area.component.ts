import { Component, OnDestroy, OnInit } from '@angular/core';
import { Activity, DfgArc, Edge, Place, Transition } from './models';
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
    private _arcs: Array<Edge> = new Array<Edge>();

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
        return this._arcs;
    }

    ngOnInit(): void {
        // Subcribe to Observable from service which calculates coordinates...
        this.calculateCoordiantesService.graph$.subscribe((graph) => {
            const nodes: Array<Activity> = graph.nodes.map((node) => {
                return new Activity(node.id, node.x, node.y);
            });

            const arcs: Array<Edge> = [];
            graph.edges.forEach((edge) => {
                const startNode: Activity = nodes.find(
                    (node) => edge.source.id === node.id,
                )!;
                const endNode: Activity = nodes.find(
                    (node) => edge.target.id === node.id,
                )!;

                arcs.push(new DfgArc(startNode, endNode));
            });

            this._activities = nodes;
            this._arcs = arcs;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from Observable subscriptions...
    }
}
