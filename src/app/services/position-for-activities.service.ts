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
    private readonly _updateArcCoordinates$: BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    > = new BehaviorSubject<
        [activityId: string, dfgId: string, x: number, y: number]
    >(['', '', 0, 0]);

    get updateArcCoordinates$(): Observable<
        [activityId: string, dfgId: string, x: number, y: number]
    > {
        return this._updateArcCoordinates$.asObservable();
    }

    //--------- Subscription 3 ---------
    private readonly _boxDimensions$: BehaviorSubject<Box[]> =
        new BehaviorSubject<Box[]>([]);

    get boxDimensions$(): Observable<Box[]> {
        return this._boxDimensions$.asObservable();
    }

    updatePosition(
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

    updateCoordinatesOfArcs(
        activityId: string,
        dfgId: string,
        newX: number,
        newY: number,
    ): void {
        this._updateArcCoordinates$.next([activityId, dfgId, newX, newY]);
    }

    passBoxObjects(box: Box[]): void {
        this._boxDimensions$.next(box);
    }
}
