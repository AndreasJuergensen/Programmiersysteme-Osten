import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContextMenuService {
    private readonly _visability$: BehaviorSubject<string> =
        new BehaviorSubject<string>('hidden');
    private readonly _position$: BehaviorSubject<{ x: number; y: number }> =
        new BehaviorSubject<{ x: number; y: number }>({ x: 0, y: 0 });

    constructor() {}

    get visibility$() {
        return this._visability$.asObservable();
    }

    get position$() {
        return this._position$.asObservable();
    }

    showAt(x: number, y: number) {
        this._visability$.next('visible');
        this._position$.next({ x, y });
    }

    hide() {
        this._visability$.next('hidden');
    }
}
