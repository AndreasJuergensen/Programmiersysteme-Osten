import { CalculateCoordinatesService } from './calculate-coordinates.service';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
import { Graph, Node, Edge } from '../classes/graph';
import { environment } from 'src/environments/environment';

describe('CalculateCoordinatesService', () => {
    let sut: CalculateCoordinatesService;

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

        const playNode = new Node('play', startXCoordinate, startYCoordinate);
        const stopNode = new Node(
            'stop',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate,
        );

        const expectedGraph: Graph = new Graph(
            [playNode, stopNode],
            [new Edge(playNode, stopNode)],
        );

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            console.log(graph);
            console.log(expectedGraph);
            expect(graph.asJson()).toEqual(expectedGraph.asJson());
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

        const playNode = new Node('play', startXCoordinate, startYCoordinate);
        const ANode = new Node(
            'A',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate,
        );
        const BNode = new Node(
            'B',
            startXCoordinate + environment.drawingGrid.gapX * 2,
            startYCoordinate,
        );
        const CNode = new Node(
            'C',
            startXCoordinate + environment.drawingGrid.gapX * 3,
            startYCoordinate,
        );
        const stopNode = new Node(
            'stop',
            startXCoordinate + environment.drawingGrid.gapX * 4,
            startYCoordinate,
        );

        const expectedGraph: Graph = new Graph(
            [playNode, ANode, BNode, CNode, stopNode],
            [
                new Edge(playNode, ANode),
                new Edge(ANode, BNode),
                new Edge(BNode, CNode),
                new Edge(CNode, stopNode),
            ],
        );

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph.asJson()).toEqual(expectedGraph.asJson());
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

        const playNode = new Node('play', startXCoordinate, startYCoordinate);
        const ANode = new Node(
            'A',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate + environment.drawingGrid.gapY,
        );
        const BNode = new Node(
            'B',
            startXCoordinate + environment.drawingGrid.gapX * 2,
            startYCoordinate + environment.drawingGrid.gapY,
        );
        const XNode = new Node(
            'X',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate,
        );
        const YNode = new Node(
            'Y',
            startXCoordinate + environment.drawingGrid.gapX * 2,
            startYCoordinate,
        );
        const stopNode = new Node(
            'stop',
            startXCoordinate + environment.drawingGrid.gapX * 3,
            startYCoordinate,
        );

        const expectedGraph: Graph = new Graph(
            [playNode, XNode, YNode, stopNode, ANode, BNode],
            [
                new Edge(playNode, ANode),
                new Edge(ANode, BNode),
                new Edge(BNode, stopNode),
                new Edge(playNode, XNode),
                new Edge(XNode, YNode),
                new Edge(YNode, stopNode),
            ],
        );

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph.asJson()).toEqual(expectedGraph.asJson());
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

        const playNode = new Node('play', startXCoordinate, startYCoordinate);
        const ANode = new Node(
            'A',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate,
        );
        const BNode = new Node(
            'B',
            startXCoordinate + environment.drawingGrid.gapX * 3,
            startYCoordinate,
        );
        const CNode = new Node(
            'C',
            startXCoordinate + environment.drawingGrid.gapX * 2,
            startYCoordinate + environment.drawingGrid.gapY,
        );
        const DNode = new Node(
            'D',
            startXCoordinate + environment.drawingGrid.gapX * 4,
            startYCoordinate,
        );
        const stopNode = new Node(
            'stop',
            startXCoordinate + environment.drawingGrid.gapX * 5,
            startYCoordinate,
        );

        const expectedGraph: Graph = new Graph(
            [playNode, ANode, CNode, BNode, DNode, stopNode],
            [
                new Edge(playNode, ANode),
                new Edge(ANode, BNode),
                new Edge(BNode, CNode),
                new Edge(CNode, DNode),
                new Edge(ANode, CNode),
                new Edge(CNode, BNode),
                new Edge(BNode, DNode),
                new Edge(DNode, stopNode),
            ],
        );

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph.asJson()).toEqual(expectedGraph.asJson());
        });
    });

    it('DFG with four Traces, same Activities but different order', () => {
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

        const playNode = new Node('play', startXCoordinate, startYCoordinate);
        const ANode = new Node(
            'A',
            startXCoordinate + environment.drawingGrid.gapX,
            startYCoordinate,
        );
        const BNode = new Node(
            'B',
            startXCoordinate + environment.drawingGrid.gapX * 4,
            startYCoordinate + environment.drawingGrid.gapY,
        );
        const CNode = new Node(
            'C',
            startXCoordinate + environment.drawingGrid.gapX * 2,
            startYCoordinate,
        );
        const DNode = new Node(
            'D',
            startXCoordinate + environment.drawingGrid.gapX * 3,
            startYCoordinate,
        );
        const XNode = new Node(
            'X',
            startXCoordinate + environment.drawingGrid.gapX * 3,
            startYCoordinate + environment.drawingGrid.gapY,
        );
        const stopNode = new Node(
            'stop',
            startXCoordinate + environment.drawingGrid.gapX * 4,
            startYCoordinate,
        );

        const expectedGraph: Graph = new Graph(
            [playNode, ANode, CNode, DNode, stopNode, XNode, BNode],
            [
                new Edge(playNode, ANode),
                new Edge(ANode, BNode),
                new Edge(BNode, XNode),
                new Edge(XNode, DNode),
                new Edge(ANode, XNode),
                new Edge(XNode, BNode),
                new Edge(BNode, DNode),
                new Edge(ANode, CNode),
                new Edge(CNode, XNode),
                new Edge(XNode, CNode),
                new Edge(CNode, DNode),
                new Edge(DNode, stopNode),
            ],
        );
        console.log(expectedGraph);

        sut.calculateCoordinates(dfg);

        sut.graph$.subscribe((graph) => {
            expect(graph.asJson()).toEqual(expectedGraph.asJson());
        });
    });
});
