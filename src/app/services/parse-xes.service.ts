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
        const xesFile: XesFile = xmlParser.parse(content);
        const eventLog: EventLog = EventLog.fromXml(xesFile.log);
        return eventLog.toString();
    }
}

interface XesFile {
    log: EventLogXml
}