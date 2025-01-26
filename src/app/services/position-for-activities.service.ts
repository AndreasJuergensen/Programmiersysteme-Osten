import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity, Arc, Box } from '../components/drawing-area';
import { BoxNode } from '../classes/graph';

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

    // //--------- Subscription 4 ---------
    // private readonly _movingPlaceInGraph$: BehaviorSubject<
    //     [place: string, x: number, y: number]
    // > = new BehaviorSubject<[placeId: string, x: number, y: number]>([
    //     '',
    //     0,
    //     0,
    // ]);

    // get movingPlaceInGraph$(): Observable<
    //     [placeId: string, x: number, y: number]
    // > {
    //     return this._movingPlaceInGraph$.asObservable();
    // }

    //--------- Subscription 5 ---------
    private readonly _updateEndPositionOfElement$: BehaviorSubject<
        [elementId: string, elementType: string, x: number, y: number]
    > = new BehaviorSubject<
        [elementId: string, elementType: string, x: number, y: number]
    >(['', '', 0, 0]);

    get updateEndPositionOfElement$(): Observable<
        [elementId: string, elementType: string, x: number, y: number]
    > {
        return this._updateEndPositionOfElement$.asObservable();
    }

    //--------- Subscription 6 ---------
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

    updateActivityPosition(
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

    // updatePlacePosition(
    //     placeId: string,
    //     xTranslate: number,
    //     yTranslate: number,
    // ) {
    //     this._movingPlaceInGraph$.next([placeId, xTranslate, yTranslate]);
    // }

    updateElementPosition(
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

    updateCoordinatesOfBoxArcs(
        activityId: string,
        dfgId: string,
        newX: number,
        newY: number,
    ): void {
        this._updateBoxArcCoordinates$.next([activityId, dfgId, newX, newY]);
    }

    updateEndPositionOfElement(
        elementId: string,
        elementType: string,
        newX: number,
        newY: number,
    ) {
        this._updateEndPositionOfElement$.next([
            elementId,
            elementType,
            newX,
            newY,
        ]);
    }

    // updateCoordinatesOfArcs(placeId: string, newX: number, newY: number) {
    //     this._updateArcCoordinates$.next([placeId, newX, newY]);
    // }

    passBoxObjects(box: Box[]): void {
        this._boxDimensions$.next(box);
    }
}
