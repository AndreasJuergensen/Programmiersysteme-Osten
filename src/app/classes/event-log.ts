export interface EventLog {
    traces: Trace[];
}

export interface Trace {
    events: Activity[];
}

export interface Activity {
    name: string;
}
