import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    constructor() {}

    public cut(value: string): void {
        console.log('cut durchgefuehrt!' + ' selected Cut: ' + value);
    }
}
