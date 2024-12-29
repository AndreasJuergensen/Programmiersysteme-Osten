import { Injectable } from '@angular/core';
import { XMLParser } from 'fast-xml-parser';
import { EventLog, EventLogXml } from '../classes/xml/eventlog';

@Injectable({
    providedIn: 'root',
})
export class ParseXesService {
    constructor() {}

    public parse(content: string): string {
        const xmlParser: XMLParser = new XMLParser({
            ignoreAttributes: false,
        });
        const eventLogXml: EventLogXml = xmlParser.parse(content);
        const eventLog: EventLog = EventLog.fromXml(eventLogXml);
        return eventLog.toString();
    }
}
