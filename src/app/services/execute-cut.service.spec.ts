import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;

    beforeEach(() => {
        sut = new ExecuteCutService();
    });

    // it('test', () => {});

    it('no valid exclusive cut on a simple dfg', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('play', 'A'));

        const selectedCutViaRadioButton: string = 'ExclusiveCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeFalse();
    });

    it('valid exclusive cut on a simple dfg', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('C', 'stop'));

        const selectedCutViaRadioButton: string = 'ExclusiveCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeTrue();
    });

    it('valid paralllel cut', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .addFromPlayArc('A')
            .addFromPlayArc('D')
            .addToStopArc('C')
            .addToStopArc('D')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('A', 'D')
            .addArc('D', 'A')
            .addArc('B', 'D')
            .addArc('D', 'B')
            .addArc('C', 'D')
            .addArc('D', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'D'))
            .addArc(dfg.getArc('A', 'D'))
            .addArc(dfg.getArc('D', 'A'))
            .addArc(dfg.getArc('B', 'D'))
            .addArc(dfg.getArc('D', 'B'))
            .addArc(dfg.getArc('C', 'D'))
            .addArc(dfg.getArc('D', 'C'))
            .addArc(dfg.getArc('D', 'stop'));
        const selectedCutViaRadioButton: string = 'ParallelCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeTrue();
    });

    it('valid sequence cut', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addArc('A', 'C')
            .addArc('B', 'D')
            .addArc('C', 'D')
            .addArc('D', 'C')
            .addToStopArc('C')
            .addToStopArc('D')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('A', 'C'))
            .addArc(dfg.getArc('B', 'D'));
        const selectedCutViaRadioButton: string = 'SequenceCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeTrue();
    });

    it('valid loop cut on a simple dfg', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('C', 'A'))
            .addArc(dfg.getArc('B', 'C'));
        const selectedCutViaRadioButton: string = 'LoopCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeTrue();
    });
});
