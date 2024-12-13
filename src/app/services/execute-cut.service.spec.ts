import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder, DfgJson } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { CalculateDfgService } from './calculate-dfg.service';
import { EventLog, Trace } from '../classes/event-log';
import { Activity } from '../classes/dfg/activities';
import { PetriNetManagementService } from './petri-net-management.service';
import { cutType } from '../components/cut-execution/cut-execution.component';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;
    let calculateDfgService: CalculateDfgService;
    let pnManagementService: PetriNetManagementService;

    beforeEach(() => {
        sut = new ExecuteCutService(new PetriNetManagementService());
        calculateDfgService = new CalculateDfgService();
        pnManagementService = new PetriNetManagementService();
    });

    it('test', () => {});

    // it('Testing execute methode with exclusive Cut on simple dfg', () => {
    //     const eventLog: EventLog = new EventLog([
    //         new Trace([new Activity('A'), new Activity('B')]),
    //         new Trace([new Activity('C')]),
    //     ]);
    //     const dfg: Dfg = calculateDfgService.calculate(eventLog);
    //     const cuttedArcs: Arcs = new Arcs()
    //         .addArc(dfg.getArc('play', 'C'))
    //         .addArc(dfg.getArc('C', 'stop'));
    //     const selectedCutViaRadioButton: cutType = cutType.ExclusiveCut;
    //     pnManagementService.initialize(dfg);

    //     spyOn(pnManagementService, 'updatePnByExclusiveCut');

    //     sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

    //     expect(pnManagementService.updatePn()).toHaveBeenCalled();
    // });
});
