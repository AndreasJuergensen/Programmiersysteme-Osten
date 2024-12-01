import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;

    beforeEach(() => {
        sut = new ExecuteCutService();
    });

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
            .addArc(dfg.getArc('play', 'A'))
            .addArc(dfg.getArc('play', 'C'));

        const selectedCutViaRadioButton: string = 'ExclusiveCut';

        const result: boolean = sut.validateCut(
            dfg,
            cuttedArcs,
            selectedCutViaRadioButton,
        );

        expect(result).toBeFalse();
    });
});
