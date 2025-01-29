import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Box } from '../components/drawing-area';

@Injectable({
    providedIn: 'root',
})
export class PositionForActivitiesService {
    constructor() {}

    //--------- Subscription 1 ---------
    private readonly _movingActivityInGraph$: BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    > = new BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    >(['', '', 0, 0]);

    get movingActivityInGraph$(): Observable<
        [activityId: string, dfgId: string, x: number, y: number]
    > {
        return this._movingActivityInGraph$.asObservable();
    }

    //--------- Subscription 2 ---------
    private readonly _updateBoxArcCoordinates$: BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    > = new BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    >(['', '', 0, 0]);

    get updateBoxArcCoordinates$(): Observable<
        [activityId: string, dfgId: string, x: number, y: number]
    > {
        return this._updateBoxArcCoordinates$.asObservable();
    }

    //--------- Subscription 3 ---------
    private readonly _boxDimensions$: BehaviorSubject<Box[]> =
        new BehaviorSubject<Box[]>([]);

    get boxDimensions$(): Observable<Box[]> {
        return this._boxDimensions$.asObservable();
    }

    //--------- Subscription 4 ---------
    private readonly _updateEndPositionOfElement$: BehaviorSubject<
        [
            elementId: string,
            elementType: string,
            x: number,
            y: number,
            xTranslate: number,
            yTranslate: number,
        ]
    > = new BehaviorSubject<
        [
            elementId: string,
            elementType: string,
            x: number,
            y: number,
            xTranslate: number,
            yTranslate: number,
        ]
    >(['', '', 0, 0, 0, 0]);

    get updateEndPositionOfElement$(): Observable<
        [
            elementId: string,
            elementType: string,
            x: number,
            y: number,
            xTranslate: number,
            yTranslate: number,
        ]
    > {
        return this._updateEndPositionOfElement$.asObservable();
    }

    //--------- Subscription 5 ---------
    private readonly _movingElementInGraph$: BehaviorSubject<
        [elementId: string, elementType: string, x: number, y: number]
    > = new BehaviorSubject<
        [elementId: string, elementType: string, x: number, y: number]
    >(['', '', 0, 0]);

    get movingElementInGraph$(): Observable<
        [elementId: string, elementType: string, x: number, y: number]
    > {
        return this._movingElementInGraph$.asObservable();
    }

    //--------- MAIN ---------

    public updateActivityPosition(
        activityId: string,
        dfgId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        this._movingActivityInGraph$.next([
            activityId,
            dfgId,
            xTranslate,
            yTranslate,
        ]);
    }

    public updateElementPosition(
        elementId: string,
        elementType: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        this._movingElementInGraph$.next([
            elementId,
            elementType,
            xTranslate,
            yTranslate,
        ]);
    }

    public updateCoordinatesOfBoxArcs(
        activityId: string,
        dfgId: string,
        newX: number,
        newY: number,
    ): void {
        this._updateBoxArcCoordinates$.next([activityId, dfgId, newX, newY]);
    }

    public updateEndPositionOfElement(
        elementId: string,
        elementType: string,
        newX: number,
        newY: number,
        xTranslate: number,
        yTranslate: number,
    ) {
        this._updateEndPositionOfElement$.next([
            elementId,
            elementType,
            newX,
            newY,
            xTranslate,
            yTranslate,
        ]);
    }

    passBoxObjects(box: Box[]): void {
        this._boxDimensions$.next(box);
    }
}
