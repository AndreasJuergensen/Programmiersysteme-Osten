import { Component, OnDestroy, OnInit } from '@angular/core';
import { Activity, Edge, Place, Transition } from './models';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnInit, OnDestroy {
    private _activities: Array<Activity> = new Array<Activity>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _edges: Array<Edge> = new Array<Edge>();

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
    }

    ngOnDestroy(): void {
        // Unsubscribe from Observable subscriptions...
    }
}
