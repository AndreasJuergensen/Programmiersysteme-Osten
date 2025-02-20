import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Box } from '../components/drawing-area';

interface TransformData {
    x: number;
    y: number;
    transform: string;
}

interface Translation {
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root',
})
export class DragAndDropService {
    private positions = new Map<string, TransformData>();
    private boxTranslation = new Map<string, Translation>();

    private transformSubject$ = new BehaviorSubject<Map<string, TransformData>>(
        this.positions,
    );
    getTransforms() {
        return this.transformSubject$.asObservable();
    }

    private transformBox$ = new BehaviorSubject<{
        value: string;
        map: Map<string, Translation>;
    }>({ value: '', map: new Map() });

    getTransformBox$ = this.transformBox$.asObservable();

    private readonly _boxDimensions$: BehaviorSubject<Box[]> =
        new BehaviorSubject<Box[]>([]);

    get boxDimensions$(): Observable<Box[]> {
        return this._boxDimensions$.asObservable();
    }

    private readonly activitySelected$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);

    get activitySelected(): Observable<boolean> {
        return this.activitySelected$.asObservable();
    }

    setActivitySelected(value: boolean): void {
        this.activitySelected$.next(value);
    }

    passBoxObjects(box: Box[]): void {
        this._boxDimensions$.next(box);
    }

    updatePosition(id: string, transform: string, newX: number, newY: number) {
        this.positions.set(id, { transform, x: newX, y: newY });
        this.transformSubject$.next(new Map(this.positions));
    }

    removePosition(id: string) {
        this.positions.delete(id);
        this.transformSubject$.next(new Map(this.positions));
    }

    updateBoxPosition(id: string, xTranslate: number, yTranslate: number) {
        this.boxTranslation.set(id, { x: xTranslate, y: yTranslate });
        this.transformBox$.next({ value: id, map: this.boxTranslation });
    }

    clearAll() {
        this.positions.clear();
        this.boxTranslation.clear();
    }
}
