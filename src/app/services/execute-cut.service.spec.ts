import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
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
    });

    // it('test', () => {});

    // it('execute invalid exclusive cut on a simple dfg', () => {
    //     const dfg: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('C')
    //         .addToStopArc('B')
    //         .addToStopArc('C')
    //         .addArc('A', 'B')
    //         .build();
    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('play', 'C'))
    //         .addArc(dfg.getArc('play', 'A'));

    //     const selectedCutViaRadioButton: string = 'ExclusiveCut';

    //     const result: { dfg1: Dfg; dfg2: Dfg } | void = sut.execute(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );

    //     expect(result).toEqual();
    // });

    // it('valid exclusive cut on a simple dfg', () => {
    //     const eventLog: EventLog = new EventLog([
    //         new Trace([new Activity('A'), new Activity('B')]),
    //         new Trace([new Activity('C')]),
    //     ]);

    //     const dfg: Dfg = calculateDfgService.calculate(eventLog);
    //     // console.log('test');
    //     // console.log(dfg);

    //     // console.log(dfg.getEventLog());

    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('play', 'C'))
    //         .addArc(dfg.getArc('C', 'stop'));

    //     const selectedCutViaRadioButton: string = 'ExclusiveCut';

    //     const dfg1: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .addFromPlayArc('A')
    //         .addToStopArc('B')
    //         .addArc('A', 'B')
    //         .build();
    //     const dfg2: Dfg = new DfgBuilder()
    //         .createActivity('C')
    //         .addFromPlayArc('C')
    //         .addToStopArc('C')
    //         .build();

    //     const result: { dfg1: Dfg; dfg2: Dfg } | void = sut.execute(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );
    //     console.log(dfg1);
    //     console.log(dfg2);
    //     console.log(result);

    //     expect(result).toEqual({ dfg1, dfg2 });
    // });

    // it('valid paralllel cut', () => {
    //     const dfg: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('D')
    //         .addToStopArc('C')
    //         .addToStopArc('D')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('A', 'D')
    //         .addArc('D', 'A')
    //         .addArc('B', 'D')
    //         .addArc('D', 'B')
    //         .addArc('C', 'D')
    //         .addArc('D', 'C')
    //         .build();
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

    //     const result: boolean = sut.validateCut(
    //         dfg,
    //         cuttedArcs,
    //         selectedCutViaRadioButton,
    //     );

    //     expect(result).toBeTrue();
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
