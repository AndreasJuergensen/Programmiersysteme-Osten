import { Event, EventXml, fromXml as eventFromXml } from "./event";

export interface TraceXml {
    event: EventXml[];
}

export class Trace {
    constructor(
        private readonly traceXml: TraceXml,
        private readonly eventFactory: (
            eventXml: EventXml,
        ) => Event = eventFromXml,
    ) {}

    static fromXml(traceXml: TraceXml): Trace {
        return new Trace(traceXml);
    }

    toString(): string {
        return this.traceXml.event
            .map(this.eventFactory)
            .filter(event => event.isLifecycleComplete())
            .map((event) => event.toString())
            .join(' ');
    }
}
