import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    /* [^\+]+ = 1 bis n beliebige Zeichen außer "+"
    (?:\+[^\+]+)* = 0 bis n mal ("+" gefolgt von einem String bestehend aus 1 bis n beliebigen Zeichen außer "+") */

    private readonly validEventLogPattern = /^[^\+]+(?:\+[^\+]+)*$/;
    constructor() {}

    validateInput(input: string): boolean {
        return this.validEventLogPattern.test(input);
    }
}
