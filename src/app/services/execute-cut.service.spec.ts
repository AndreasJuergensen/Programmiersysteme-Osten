import { ExecuteCutService } from './execute-cut.service';
import { Dfg, DfgBuilder, DfgJson } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { CalculateDfgService } from './calculate-dfg.service';
import { EventLog, Trace } from '../classes/event-log';
import { Activity } from '../classes/dfg/activities';
import { PetriNetManagementService } from './petri-net-management.service';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;
    let calculateDfgService: CalculateDfgService;

    beforeEach(() => {
        sut = new ExecuteCutService(new PetriNetManagementService());
        calculateDfgService = new CalculateDfgService();
    });

    it('test', () => {});
});
