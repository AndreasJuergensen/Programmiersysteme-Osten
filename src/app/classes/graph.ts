import { Activity } from './dfg/activities';

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}

export interface Node {
    id: string;
    x: number;
    y: number;
}

export interface Edge {
    source: Node;
    target: Node;
}

export interface StackElement {
    activity: Activity;
    source_x: number;
    source_y: number;
}
