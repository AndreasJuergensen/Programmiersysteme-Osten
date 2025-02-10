import { Trace, TraceXml } from './trace';

export interface EventLogXml {
    trace: TraceXml[];
}

export class EventLog {
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
        return [
            ...new Set(
                this.eventLogXml.trace
                    .map(this.traceFactory)
                    .map((trace) => trace.toString()),
            ),
        ].join(' +\n');
    }
}
