import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Diagram } from './models';
import { Graph } from 'src/app/classes/graph';

@Injectable({
    providedIn: 'root',
})
export class DrawingService implements OnDestroy {
    private readonly _diagram$: BehaviorSubject<Diagram> =
        new BehaviorSubject<Diagram>(new Diagram([]));

    private readonly _graph$: BehaviorSubject<Graph> =
        new BehaviorSubject<Graph>(new Graph());

    constructor() {}

    ngOnDestroy(): void {
        this._diagram$.complete();
        this._graph$.complete();
    }

    get diagram$(): Observable<Diagram> {
        return this._diagram$.asObservable();
    }

    public drawDiagram(diagram: Diagram): void {
        this._diagram$.next(diagram);
    }

    get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    }

    public drawGraph(graph: Graph): void {
        this._graph$.next(graph);
    }
}
