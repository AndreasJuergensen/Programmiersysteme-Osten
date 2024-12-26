import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    /* [^\+]+ = 1 bis n beliebige Zeichen außer "+"
    (?:\+[^\+]+)* = 0 bis n mal ("+" gefolgt von einem String bestehend aus 1 bis n beliebigen Zeichen außer "+") */

    private readonly validEventLogPattern = /^[^\+]+(?:\+[^\+]+)*$/;
    private readonly validEventLogPattern2 =
        /^[^\+\s]+(?:\s[^\+\s]+)*(?:\s\+\s[^\+\s]+)*$/;
    private readonly validEventLogPattern3 =
        /^[^\+\s]+(?:\s[^\+\s]+)*(?:\s\+\s[^\+\s]+)*(?:\s[^\+\s]+)*$/;
    private readonly validEventLogPattern4 =
        /^[^\+\s]+(?:\s[^\+\s]+)*(?:\s?\+\s?[^\+\s]+)*$/;
    private readonly validEventLogPattern5 =
        /^[^\+\s]+(?:\s[^\+\s]+)*(?:\s?\+\s?[^\+\s]+)*$/;
    private readonly validEventLogPattern6 =
        /^[^\+\s]+(?:\s[^\+\s]+)*(?:\s?\+\s?[^\+\s]+)*(?:\s[^\+\s]+)*$/;
    private readonly validEventLogPattern7 =
        /^[^\+\s]+((?:\s[^\+\s]+)*(?:\s?\+\s?[^\+\s]+)*(?:\s[^\+\s]+)*)*$/;
    private readonly validEventLogPattern8 =
        /^[^\+\s]+(?:\s?[^\+\s]+)*(?:\s?\+\s?[^\+\s]+)*$/;
    private readonly validEventLogPattern9 =
        /^[^\+\s]+((?:\s[^\+\s]+)*|(?:\s?\+\s?[^\+\s]+)*(?:\s[^\+\s]+)*)*$/;
    constructor() {}

    validateInput(input: string): boolean {
        return this.validEventLogPattern9.test(input);
    }
}
