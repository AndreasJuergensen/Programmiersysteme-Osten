import { Event, EventXml } from "./event";

export interface TraceXml {
    event: EventXml[];
}

export class Trace {
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
            .map((event) => event.toString())
            .join(' ');
    }
}
