import { ExecuteCutService } from './execute-cut.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { CalculateDfgService } from './calculate-dfg.service';
import { EventLog, Trace } from '../classes/event-log';
import { Activity } from '../classes/dfg/activities';
import { PetriNetManagementService } from './petri-net-management.service';
import { CutType } from '../components/cut-execution/cut-execution.component';
import { mock, instance } from 'ts-mockito';
import { ShowFeedbackService } from './show-feedback.service';

describe('ExecuteCutService', () => {
    let sut: ExecuteCutService;
    let calculateDfgService: CalculateDfgService;
    let pnManagementServiceSpy: PetriNetManagementService;

    let showFeedbackServiceMock: ShowFeedbackService =
        mock(ShowFeedbackService);

    let showFeedbackServiceMockInstance: ShowFeedbackService = instance(
        showFeedbackServiceMock,
    );

    beforeEach(() => {
        pnManagementServiceSpy = new PetriNetManagementService(showFeedbackServiceMockInstance);
        calculateDfgService = new CalculateDfgService();
        sut = new ExecuteCutService(
            pnManagementServiceSpy,
            calculateDfgService,
            showFeedbackServiceMockInstance,
        );
    });

    it('test', () => {});

    it('Testing on simple dfg if wrong selected Cut returns nothing', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
            ]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('B', 'C'))
            .addArc(dfg.getArc('C', 'A'));
        const selectedCutViaRadioButton: CutType = CutType.SequenceCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnByLoopCut');

        const result = sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(pnManagementServiceSpy.updatePnByLoopCut).toHaveBeenCalledTimes(
            0,
        );

        expect(result).toEqual();
    });

    it('Testing on simple dfg if wrong selected Arcs returns nothing', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('C')]),
            new Trace([
                new Activity('A'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('B'),
            ]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('C', 'stop'))
            .addArc(dfg.getArc('A', 'B'))
            .addArc(dfg.getArc('B', 'C'))
            .addArc(dfg.getArc('C', 'B'));
        const selectedCutViaRadioButton: CutType = CutType.ParallelCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnByParallelCut');

        const result = sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(
            pnManagementServiceSpy.updatePnByParallelCut,
        ).toHaveBeenCalledTimes(0);

        expect(result).toEqual();
    });

    it('Testing execute method with exclusive Cut on simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('C')]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('C', 'stop'));
        const selectedCutViaRadioButton: CutType = CutType.ExclusiveCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnByExclusiveCut');

        sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(
            pnManagementServiceSpy.updatePnByExclusiveCut,
        ).toHaveBeenCalled();
    });

    it('Testing sequence method with sequence Cut on simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs().addArc(dfg.getArc('A', 'B'));
        const selectedCutViaRadioButton: CutType = CutType.SequenceCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnBySequenceCut');

        sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(pnManagementServiceSpy.updatePnBySequenceCut).toHaveBeenCalled();
    });

    it('Testing parallel method with parallel Cut on simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('C')]),
            new Trace([
                new Activity('A'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('B'),
            ]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('play', 'C'))
            .addArc(dfg.getArc('C', 'stop'))
            .addArc(dfg.getArc('A', 'C'))
            .addArc(dfg.getArc('C', 'A'))
            .addArc(dfg.getArc('B', 'C'))
            .addArc(dfg.getArc('C', 'B'));
        const selectedCutViaRadioButton: CutType = CutType.ParallelCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnByParallelCut');

        sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(pnManagementServiceSpy.updatePnByParallelCut).toHaveBeenCalled();
    });

    it('Testing loop method with loop Cut on simple dfg', () => {
        const eventLog: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
            ]),
        ]);
        const dfg: Dfg = calculateDfgService.calculate(eventLog);
        const cuttedArcs: Arcs = new Arcs()
            .addArc(dfg.getArc('B', 'C'))
            .addArc(dfg.getArc('C', 'A'));
        const selectedCutViaRadioButton: CutType = CutType.LoopCut;
        pnManagementServiceSpy.initialize(dfg);

        spyOn(pnManagementServiceSpy, 'updatePnByLoopCut');

        sut.execute(dfg, cuttedArcs, selectedCutViaRadioButton);

        expect(pnManagementServiceSpy.updatePnByLoopCut).toHaveBeenCalled();
    });
});
