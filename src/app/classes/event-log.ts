export interface EventLog {
    traces: Trace[];
}

export interface Trace {
    activities: Activity[];
}

export interface Activity {
    name: string;
}
