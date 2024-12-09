import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder, DfgJson } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { CalculateDfgService } from './calculate-dfg.service';
import { EventLog, Trace } from '../classes/event-log';
import { Activity } from '../classes/dfg/activities';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;
    let calculateDfgService: CalculateDfgService;

    beforeEach(() => {
        sut = new ExecuteCutService();
        calculateDfgService = new CalculateDfgService();
        // jasmine.addMatchers({
        //     toEqualIgnoringId: () => ({
        //         compare: (
        //             actual: { id: any; actual: any },
        //             expected: { id: any; expected: any },
        //         ) => {
        //             const { id: _, ...actualWithoutId } = actual;
        //             const { id: __, ...expectedWithoutId } = expected;

        //             const pass =
        //                 JSON.stringify(actualWithoutId) ===
        //                 JSON.stringify(expectedWithoutId);

        //             return {
        //                 pass,
        //                 message: pass
        //                     ? 'Objects are equal ignoring id'
        //                     : 'Objects differ when ignoring id',
        //             };
        //         },
        //     }),
        // });
    });

    // it('test', () => {});

    it('execute invalid exclusive cut on a simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('C')]),
        ]);

        const dfg: Dfg = calculateDfgService.calculate(eventLog);

        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('play', 'A'));

        const selectedCutViaRadioButton: string = 'ExclusiveCut';

        const result: [Dfg, Dfg] | void = sut.execute(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toEqual();
    });

    it('valid exclusive cut on a simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('C')]),
        ]);

        const dfg: Dfg = calculateDfgService.calculate(eventLog);

        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('C', 'stop'));

        const selectedCutViaRadioButton: string = 'ExclusiveCut';

        const eventLog1: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
        ]);
        const eventLog2: EventLog = new EventLog([
            new Trace([new Activity('C')]),
        ]);

        const dfg1: Dfg = calculateDfgService.calculate(eventLog1);
        const dfg2: Dfg = calculateDfgService.calculate(eventLog2);
        const result: [Dfg, Dfg] | void = sut.execute(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toEqual([dfg1, dfg2]);
    });

    // it('valid paralllel cut', () => {
    //     const eventLog: EventLog = new EventLog([
    //         new Trace([
    //             new Activity('A'),
    //             new Activity('B'),
    //             new Activity('C'),
    //             new Activity('D'),
    //             new Activity('C'),
    //         ]),
    //         new Trace([
    //             new Activity('D'),
    //             new Activity('B'),
    //             new Activity('D'),
    //         ]),
    //         new Trace([
    //             new Activity('A'),
    //             new Activity('D'),
    //             new Activity('A'),
    //             new Activity('B'),
    //             new Activity('C'),
    //         ]),
    //     ]);

    //     const dfg: Dfg = calculateDfgService.calculate(eventLog);

    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('play', 'D'))
    //         .addArc(dfg.getArc('A', 'D'))
    //         .addArc(dfg.getArc('D', 'A'))
    //         .addArc(dfg.getArc('B', 'D'))
    //         .addArc(dfg.getArc('D', 'B'))
    //         .addArc(dfg.getArc('C', 'D'))
    //         .addArc(dfg.getArc('D', 'C'))
    //         .addArc(dfg.getArc('D', 'stop'));
    //     const selectedCutViaRadioButton: string = 'ParallelCut';

    //     const eventLog1: EventLog = new EventLog([
    //         new Trace([
    //             new Activity('A'),
    //             new Activity('B'),
    //             new Activity('C'),
    //             new Activity('C'),
    //         ]),
    //         new Trace([new Activity('B')]),
    //         new Trace([
    //             new Activity('A'),
    //             new Activity('A'),
    //             new Activity('B'),
    //             new Activity('C'),
    //         ]),
    //     ]);
    //     const eventLog2: EventLog = new EventLog([
    //         new Trace([new Activity('D')]),
    //         new Trace([new Activity('D'), new Activity('D')]),
    //         new Trace([new Activity('D')]),
    //     ]);

    //     const dfg1: Dfg = calculateDfgService.calculate(eventLog1);
    //     const dfg2: Dfg = calculateDfgService.calculate(eventLog2);

    //     const interim: [Dfg, Dfg] | void = sut.execute(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );
    //     const result: DfgJson[] = [interim[0].asJson(), interim[1].asJson()];

    //     expect(result).toEqual([dfg1.asJson(), dfg2.asJson()]);
    // });

    // it('valid sequence cut', () => {
    //     const dfg: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('B')
    //         .addArc('A', 'C')
    //         .addArc('B', 'D')
    //         .addArc('C', 'D')
    //         .addArc('D', 'C')
    //         .addToStopArc('C')
    //         .addToStopArc('D')
    //         .build();
    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('A', 'C'))
    //         .addArc(dfg.getArc('B', 'D'));
    //     const selectedCutViaRadioButton: string = 'SequenceCut';

    //     const result: boolean = sut.validateCut(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );

    //     expect(result).toBeTrue();
    // });

    // it('valid loop cut on a simple dfg', () => {
    //     const dfg: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .addFromPlayArc('A')
    //         .addToStopArc('B')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('C', 'A')
    //         .build();
    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('C', 'A'))
    //         .addArc(dfg.getArc('B', 'C'));
    //     const selectedCutViaRadioButton: string = 'LoopCut';

    //     const result: boolean = sut.validateCut(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );

    //     expect(result).toBeTrue();
    // });
});
