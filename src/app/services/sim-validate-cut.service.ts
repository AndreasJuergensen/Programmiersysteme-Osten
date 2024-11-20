import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SimValidateCutService {
    constructor() {}

    validateInput(input: string): boolean {
        return input.trim().length >= 5;
    }
}
