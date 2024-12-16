import { TestBed } from '@angular/core/testing';

import { CalculateCoordinatesService } from './calculate-coordinates.service';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
import { EventLog } from '../classes/event-log';
import { EventLogParserService } from './event-log-parser.service';
import { Activities, Activity } from '../classes/dfg/activities';
import { Node } from '../components/drawing-area';
import { Graph } from '../classes/graph';
import { endWith } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('CalculateCoordinatesService', () => {
    let sut: CalculateCoordinatesService;
    let eventlogParserService: EventLogParserService;

    beforeEach(() => {
        sut = new CalculateCoordinatesService();
    });

    it('DFG is empty', () => {
        //const eventlog: EventLog = new EventLog([]);
        let result: Graph;
        const startXCoordinate = 100;
        const startYCoordinate = 100;
        const dfg: Dfg = new DfgBuilder()
            .createActivity('play')
            .createActivity('stop')
            .addFromPlayArc('stop')
            .build();

        const playNode = {
            id: 'play',
            x: startXCoordinate,
            y: startYCoordinate,
        };
        const stopNode = {
            id: 'stop',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate,
        };

        const expectedGraph: Graph = {
            nodes: [playNode, stopNode],
            edges: [{ source: playNode, target: stopNode }],
        };

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph).toEqual(expectedGraph);
        });
    });

    it('DFG with one Trace', () => {
        //A B C
        let result: Graph;
        const startXCoordinate = 100;
        const startYCoordinate = 100;

        const dfg: Dfg = new DfgBuilder()
            .createActivity('play')
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('stop')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addToStopArc('C')
            .build();

        const playNode = {
            id: 'play',
            x: startXCoordinate,
            y: startYCoordinate,
        };
        const ANode = {
            id: 'A',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate,
        };
        const BNode = {
            id: 'B',
            x: startXCoordinate + environment.drawingGrid.gapX * 2,
            y: startYCoordinate,
        };
        const CNode = {
            id: 'C',
            x: startXCoordinate + environment.drawingGrid.gapX * 3,
            y: startYCoordinate,
        };
        const stopNode = {
            id: 'stop',
            x: startXCoordinate + environment.drawingGrid.gapX * 4,
            y: startYCoordinate,
        };

        const expectedGraph: Graph = {
            nodes: [playNode, ANode, BNode, CNode, stopNode],
            edges: [
                { source: playNode, target: ANode },
                { source: ANode, target: BNode },
                { source: BNode, target: CNode },
                { source: CNode, target: stopNode },
            ],
        };

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph).toEqual(expectedGraph);
        });
    });

    it('DFG with two completly different Traces', () => {
        //A B + X Y
        let result: Graph;
        const startXCoordinate = 100;
        const startYCoordinate = 100;

        const dfg: Dfg = new DfgBuilder()
            .createActivity('play')
            .createActivity('A')
            .createActivity('B')
            .createActivity('X')
            .createActivity('Y')
            .createActivity('stop')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addToStopArc('B')
            .addFromPlayArc('X')
            .addArc('X', 'Y')
            .addToStopArc('Y')
            .build();

        const playNode = {
            id: 'play',
            x: startXCoordinate,
            y: startYCoordinate,
        };
        const ANode = {
            id: 'A',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate + environment.drawingGrid.gapY,
        };
        const BNode = {
            id: 'B',
            x: startXCoordinate + environment.drawingGrid.gapX * 2,
            y: startYCoordinate + environment.drawingGrid.gapY,
        };
        const XNode = {
            id: 'X',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate,
        };
        const YNode = {
            id: 'Y',
            x: startXCoordinate + environment.drawingGrid.gapX * 2,
            y: startYCoordinate,
        };
        const stopNode = {
            id: 'stop',
            x: startXCoordinate + environment.drawingGrid.gapX * 3,
            y: startYCoordinate,
        };

        const expectedGraph: Graph = {
            nodes: [playNode, XNode, YNode, stopNode, ANode, BNode],
            edges: [
                { source: playNode, target: ANode },
                { source: ANode, target: BNode },
                { source: BNode, target: stopNode },
                { source: playNode, target: XNode },
                { source: XNode, target: YNode },
                { source: YNode, target: stopNode },
            ],
        };

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph).toEqual(expectedGraph);
        });
    });

    it('DFG with two same Traces but two switched activities', () => {
        //A B C D + A C B D
        let result: Graph;
        const startXCoordinate = 100;
        const startYCoordinate = 100;

        const dfg: Dfg = new DfgBuilder()
            .createActivity('play')
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .createActivity('stop')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'D')
            .addArc('A', 'C')
            .addArc('C', 'B')
            .addArc('B', 'D')
            .addToStopArc('D')
            .build();

        const playNode = {
            id: 'play',
            x: startXCoordinate,
            y: startYCoordinate,
        };
        const ANode = {
            id: 'A',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate,
        };
        const BNode = {
            id: 'B',
            x: startXCoordinate + environment.drawingGrid.gapX * 3,
            y: startYCoordinate,
        };
        const CNode = {
            id: 'C',
            x: startXCoordinate + environment.drawingGrid.gapX * 2,
            y: startYCoordinate + environment.drawingGrid.gapY,
        };
        const DNode = {
            id: 'D',
            x: startXCoordinate + environment.drawingGrid.gapX * 4,
            y: startYCoordinate,
        };
        const stopNode = {
            id: 'stop',
            x: startXCoordinate + environment.drawingGrid.gapX * 5,
            y: startYCoordinate,
        };

        const expectedGraph: Graph = {
            nodes: [playNode, ANode, CNode, BNode, DNode, stopNode],
            edges: [
                { source: playNode, target: ANode },
                { source: ANode, target: BNode },
                { source: BNode, target: CNode },
                { source: CNode, target: DNode },
                { source: ANode, target: CNode },
                { source: CNode, target: BNode },
                { source: BNode, target: DNode },
                { source: DNode, target: stopNode },
            ],
        };

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph).toEqual(expectedGraph);
        });
    });

    it('DFG with four Traces, same Activities but different ordner', () => {
        //A B X D + A X B D + A C X D + A X C D
        let result: Graph;
        const startXCoordinate = 100;
        const startYCoordinate = 100;

        const dfg: Dfg = new DfgBuilder()
            .createActivity('play')
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .createActivity('X')
            .createActivity('stop')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'X')
            .addArc('X', 'D')
            .addArc('A', 'X')
            .addArc('X', 'B')
            .addArc('B', 'D')
            .addArc('A', 'C')
            .addArc('C', 'X')
            .addArc('X', 'C')
            .addArc('C', 'D')
            .addToStopArc('D')
            .build();

        const playNode = {
            id: 'play',
            x: startXCoordinate,
            y: startYCoordinate,
        };
        const ANode = {
            id: 'A',
            x: startXCoordinate + environment.drawingGrid.gapX,
            y: startYCoordinate,
        };
        const BNode = {
            id: 'B',
            x: startXCoordinate + environment.drawingGrid.gapX * 4,
            y: startYCoordinate + environment.drawingGrid.gapY,
        };
        const CNode = {
            id: 'C',
            x: startXCoordinate + environment.drawingGrid.gapX * 2,
            y: startYCoordinate,
        };
        const DNode = {
            id: 'D',
            x: startXCoordinate + environment.drawingGrid.gapX * 3,
            y: startYCoordinate,
        };
        const XNode = {
            id: 'X',
            x: startXCoordinate + environment.drawingGrid.gapX * 3,
            y: startYCoordinate + environment.drawingGrid.gapY,
        };
        const stopNode = {
            id: 'stop',
            x: startXCoordinate + environment.drawingGrid.gapX * 4,
            y: startYCoordinate,
        };

        const expectedGraph: Graph = {
            nodes: [playNode, ANode, CNode, DNode, stopNode, XNode, BNode],
            edges: [
                { source: playNode, target: ANode },
                { source: ANode, target: BNode },
                { source: BNode, target: XNode },
                { source: XNode, target: DNode },
                { source: ANode, target: XNode },
                { source: XNode, target: BNode },
                { source: BNode, target: DNode },
                { source: ANode, target: CNode },
                { source: CNode, target: XNode },
                { source: XNode, target: CNode },
                { source: CNode, target: DNode },
                { source: DNode, target: stopNode },
            ],
        };

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph).toEqual(expectedGraph);
        });
    });
});
