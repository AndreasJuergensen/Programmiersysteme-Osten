import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    /* [^\+\s]+ = 1 bis n beliebige Zeichen außer "+" und Leerzeichen
    ((?:\s[^\+\s]+)*|(?:\s?\+\s?[^\+\s]+)*(?:\s[^\+\s]+)*)* eine Alternative folgt
        entweeder ein Leerzeichen gefolgt von einem String ohne Plus und Leerzeichen (0 bis n mal) ODER
        ein Plus mit optionalen Leerzeichen gefolgt von einem String ohne Plus und Leerzeichen (0 bis n mal) 
        gefolgt von einem Leerzeichen gefolgt einem String ohne Plus und Leerzeichen (0 bis n mal)*/

    private readonly validEventLogPattern =
        /^[^\+\s]+((?:\s[^\+\s]+)*|(?:\s*\+\s*[^\+\s]+)*(?:\s[^\+\s]+)*)*$/;
    constructor() {}

    validateInput(input: string): boolean {
        return this.validEventLogPattern.test(input);
    }
}
