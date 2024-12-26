import { EnvironmentInjector, Injectable } from '@angular/core';
import { XMLParser } from 'fast-xml-parser';

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

interface EventLogXml {
    trace: TraceXml[];
}

class EventLog {
    constructor(
        private readonly eventLogXml: EventLogXml,
        private readonly traceFactory: (
            traceXml: TraceXml,
        ) => Trace = Trace.fromXml,
    ) {}

    static fromXml(eventLogXml: EventLogXml): EventLog {
        return new EventLog(eventLogXml);
    }

    toString(): string {
        return this.eventLogXml.trace
            .map(this.traceFactory)
            .map(trace => trace.toString())
            .join(' +\n');
    }
}

interface TraceXml {
    event: EventXml[];
}

class Trace {
    constructor(
        private readonly traceXml: TraceXml,
        private readonly eventFactory: (
            eventXml: EventXml,
        ) => Event = Event.fromXml,
    ) {}

    static fromXml(traceXml: TraceXml): Trace {
        return new Trace(traceXml);
    }

    toString(): string {
        return this.traceXml.event
            .map(this.eventFactory)
            .map(event => event.toString())
            .join(' ');
    }
}

interface EventXml {
    string: EventXmlProperty[];
}

interface EventXmlProperty {
    '@_key': string;
    '@_value': string;
}

class Event {
    constructor(private readonly eventXml: EventXml) {}

    static fromXml(eventXml: EventXml): Event {
        return new Event(eventXml);
    }

    toString(): string {
        return this.eventXml.string.find(
            (property) => property['@_key'] === 'concept:name',
        )!['@_value'];
    }
}
