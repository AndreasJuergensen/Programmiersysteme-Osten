import { DfgCoordinateCalculatorService } from './dfg-coordinate-calculator.service';
import { DFG } from '../classes/dfg';
import { Graph, Vertex } from '../classes/graph';

describe('DfgCoordinateCalculatorService', () => {
    let sut: DfgCoordinateCalculatorService;
    let expectedDfg: DFG;

    beforeEach(() => {
        sut = new DfgCoordinateCalculatorService();
        expectedDfg = new DFG('pnt1');
    });

    it('should create graph with two vertices', () => {
        expectedDfg.addFromPlayArc('A');
        expectedDfg.addToStopArc('A');
        const graph: Graph = new Graph();
        const startVertex: Vertex = {
            id: 'play',
            name: 'play',
            x: 100,
            y: 100,
        };
        const aVertex: Vertex = {
            id: 'dfgt1',
            name: 'A',
            x: 200,
            y: 100,
        };
        const stopVertex: Vertex = {
            id: 'stop',
            name: 'stop',
            x: 400,
            y: 100,
        };
        graph.vertices.add(startVertex).add(aVertex).add(stopVertex);
        graph.edges
            .add({ id: 'play:dfgt1', start: startVertex, end: aVertex })
            .add({ id: 'dfgt1:stop', start: aVertex, end: stopVertex });
        const calculated = sut.calculate(expectedDfg);
        expect(calculated).toEqual(graph);
    });
});
