import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

    // updateBoxPosition(id: string, xTranslate: number, yTranslate: number) {
    //     this.boxTranslation.set(id, { x: xTranslate, y: yTranslate });
    //     this.transformBox$.next(
    //         new Map<string, Translation>([[id, this.boxTranslation.get(id)!]]),
    //     );
    // }

    clearAll() {
        this.positions.clear();
        this.boxTranslation.clear();
    }

    //private updateSubject = new BehaviorSubject<void>(undefined);
    //constructor() {}

    // updatePosition(id: string, x: number, y: number) {
    //     this.positions.set(id, { x, y });
    //     console.log('positions:');
    //     console.log(this.positions);

    //     this.updateSubject.next();
    // }

    // getPosition(id: string) {
    //     console.log('position:');
    //     console.log(this.positions);

    //     return this.positions.get(id) || { x: 0, y: 0 };
    // }

    // updatePosition(element: any, dx: number, dy: number) {
    //     if (this.elementsMap.has(element)) {
    //         const pos = this.elementsMap.get(element)!;
    //         this.elementsMap.set(element, { x: pos.x + dx, y: pos.y + dy });
    //     } else {
    //         this.elementsMap.set(element, { x: dx, y: dy });
    //     }
    // }

    // getPosition(element: any) {
    //     return this.elementsMap.get(element) || { x: 0, y: 0 };
    // }
}
