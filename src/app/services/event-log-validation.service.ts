import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    private readonly validEventLogPattern =
        /^(\([A-Za-z][A-Za-z0-9]*\)|[A-Za-z][A-Za-z0-9]*)(?:(\s(\([A-Za-z][A-Za-z0-9]*\)|[A-Za-z][A-Za-z0-9]*))|(\s*\+\s*(\([A-Za-z][A-Za-z0-9]*\)|[A-Za-z][A-Za-z0-9]*)))*$/;

    constructor() {}

    validateInput(input: string): boolean {
        return this.validEventLogPattern.test(input);
    }
}
