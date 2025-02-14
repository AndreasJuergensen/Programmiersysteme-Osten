import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Activity } from 'src/app/classes/dfg/activities';
import { Dfg } from 'src/app/classes/dfg/dfg';
import { EventLog, Trace } from 'src/app/classes/event-log';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { CalculateDfgService } from 'src/app/services/calculate-dfg.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { ExportService } from 'src/app/services/export.service';
import {
    PetriNetManagementService,
    RecentEventLog,
} from 'src/app/services/petri-net-management.service';
import { EventLogDialogComponent } from '../event-log-dialog/event-log-dialog.component';
import { Subscription } from 'rxjs';
import { CollectSelectedElementsService } from 'src/app/services/collect-selected-elements.service';
import {
    CutType,
    ExecuteCutService,
} from 'src/app/services/execute-cut.service';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { FallThroughHandlingService } from 'src/app/services/fall-through-handling.service';
import { NgFor } from '@angular/common';
import { ParseXesService } from 'src/app/services/parse-xes.service';
import { EventLogParserService } from 'src/app/services/event-log-parser.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Arcs } from 'src/app/classes/dfg/arcs';

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, NgFor, MatTooltipModule],
    templateUrl: './context-menu.component.html',
    styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent implements OnInit {
    @Input() visibility!: string;
    @Input() position!: { x: string; y: string };
    isRightToLeft: boolean = false;

    readonly disabling: Disabling;
    readonly exporting: Exporting;
    readonly examples: Examples;
    readonly undoing: Undoing;
    readonly dialogOpening: DialogOpening;
    readonly showingEventLog: ShowingEventLog;
    readonly resettingSelection: ResettingSelection;
    readonly executingCut: ExecutingCut;
    readonly executingFallThrough: ExecutingFallThrough;
    readonly showingArcFeedback: ShowingArcFeedback;

    constructor(
        private readonly contextMenuService: ContextMenuService,
        readonly exportService: ExportService,
        readonly applicationStateService: ApplicationStateService,
        readonly petriNetManagementService: PetriNetManagementService,
        readonly calculateDfgService: CalculateDfgService,
        readonly matDialog: MatDialog,
        readonly collectSelectedElementsService: CollectSelectedElementsService,
        readonly executeCutService: ExecuteCutService,
        readonly feedbackService: ShowFeedbackService,
        readonly fallThroughHandlingService: FallThroughHandlingService,
        readonly parseXesService: ParseXesService,
        readonly eventLogParserService: EventLogParserService,
    ) {
        this.contextMenuService.visibility$.subscribe((visibility) => {
            this.visibility = visibility;
        });
        this.contextMenuService.position$.subscribe((position) => {
            const xPosition =
                position.x > window.innerWidth - 230
                    ? position.x - 230
                    : position.x + 2;
            const yPosition =
                position.y > window.innerHeight - 448
                    ? window.innerHeight - 448
                    : position.y;
            this.position = { x: xPosition + 'px', y: yPosition + 'px' };
            this.isRightToLeft = position.x > window.innerWidth - 620;
        });
        this.exporting = new Exporting(exportService, contextMenuService);
        this.disabling = new Disabling(
            applicationStateService,
            petriNetManagementService,
            collectSelectedElementsService,
        );
        this.examples = new Examples(
            petriNetManagementService,
            calculateDfgService,
            contextMenuService,
        );
        this.undoing = new Undoing(
            petriNetManagementService,
            contextMenuService,
            this.disabling,
        );
        this.dialogOpening = new DialogOpening(
            matDialog,
            calculateDfgService,
            petriNetManagementService,
            contextMenuService,
            parseXesService,
            eventLogParserService,
        );
        this.showingEventLog = new ShowingEventLog(
            applicationStateService,
            contextMenuService,
            this.disabling,
        );
        this.resettingSelection = new ResettingSelection(
            collectSelectedElementsService,
            contextMenuService,
            this.disabling,
        );
        this.executingCut = new ExecutingCut(
            executeCutService,
            feedbackService,
            collectSelectedElementsService,
            contextMenuService,
            applicationStateService,
        );
        this.executingFallThrough = new ExecutingFallThrough(
            fallThroughHandlingService,
            contextMenuService,
        );
        this.showingArcFeedback = new ShowingArcFeedback(
            applicationStateService,
            contextMenuService,
            this.disabling,
            collectSelectedElementsService,
        );
    }
    ngOnInit(): void {
        const hide = () => {
            if (this.visibility === 'visible') {
                this.contextMenuService.hide();
            }
        };
        document
            .getElementsByTagName('body')[0]
            .addEventListener('scroll', hide);
        document
            .getElementById('drawingArea')
            ?.addEventListener('scroll', hide);
        document.addEventListener('keydown', (event) => {
            if (event.key === 's') {
                this.executingCut.executeSequenceCut();
            } else if (event.key === 'p') {
                this.executingCut.executeParallelCut();
            } else if (event.key === 'e') {
                this.executingCut.executeExclusiveCut();
            } else if (event.key === 'l') {
                this.executingCut.executeLoopCut();
            } else if (event.key === '1') {
                this.executingFallThrough.executeActivityOncePerTraceFallThrough();
            } else if (event.key === 'f') {
                this.executingFallThrough.executeFlowerModelFallThrough();
            } else if (event.key === 'u') {
                this.undoing.undoLastUpdate();
            } else if (event.key === 'r') {
                this.resettingSelection.resetSelection();
            } else if (event.key === 'a') {
                this.showingArcFeedback.toggleArcFeedback();
            } else if (event.key === 't') {
                this.showingEventLog.toggleEventLogs();
            }
        });
    }
}

class ExecutingFallThrough {
    constructor(
        private fallThroughHandlingService: FallThroughHandlingService,
        private contextMenuService: ContextMenuService,
    ) {}

    executeActivityOncePerTraceFallThrough(): void {
        this.fallThroughHandlingService.executeActivityOncePerTraceFallThrough();
        this.contextMenuService.hide();
    }

    executeFlowerModelFallThrough() {
        this.fallThroughHandlingService.executeFlowerFallThrough();
        this.contextMenuService.hide();
    }
}

class ExecutingCut {
    private isArcFeedbackReady: boolean = false;
    private showArcFeedback: boolean = false;
    private selectedCutType: CutType | undefined;
    private collectedArcs: Arcs = new Arcs();
    constructor(
        private executeCutService: ExecuteCutService,
        private feedbackService: ShowFeedbackService,
        private collectSelectedElementsService: CollectSelectedElementsService,
        private contextMenuService: ContextMenuService,
        readonly applicationStateService: ApplicationStateService,
    ) {
        applicationStateService.isArcFeedbackReady$.subscribe(
            (isArcFeedbackReady) => {
                this.isArcFeedbackReady = isArcFeedbackReady;
                if (
                    this.selectedCutType != undefined &&
                    this.collectedArcs.getArcs().length > 0
                ) {
                    this.collectSelectedElementsService.setArcFeedback(
                        this.selectedCutType,
                    );
                    if (this.showArcFeedback) {
                        this.collectSelectedElementsService.enableArcFeedback();
                        this.feedbackService.showMessage(
                            'Arc Feedback Calculation finished!',
                            false,
                        );
                    }
                }
            },
        );

        applicationStateService.showArcFeedback$.subscribe(
            (showArcFeedback) => {
                this.showArcFeedback = showArcFeedback;
            },
        );
    }

    executeExclusiveCut(): void {
        this.executeCut(CutType.ExclusiveCut);
    }

    executeSequenceCut(): void {
        this.executeCut(CutType.SequenceCut);
    }

    executeParallelCut(): void {
        this.executeCut(CutType.ParallelCut);
    }

    executeLoopCut(): void {
        this.executeCut(CutType.LoopCut);
    }

    private executeCut(cutType: CutType): void {
        this.contextMenuService.hide();
        this.selectedCutType = cutType;
        this.collectedArcs = this.collectSelectedElementsService.collectedArcs;

        if (
            this.collectSelectedElementsService.currentCollectedArcsDFG ==
            undefined
        ) {
            this.feedbackService.showMessage(
                'Please select arcs in a DFG by clicking or click-hovering them, to define a cut first.',
                true,
            );
            return;
        }

        if (
            !this.executeCutService.execute(
                this.collectSelectedElementsService.currentCollectedArcsDFG,
                this.collectSelectedElementsService.collectedArcs,
                cutType,
            )
        ) {
            if (!this.isArcFeedbackReady && this.showArcFeedback) {
                this.feedbackService.showMessage(
                    "Arc Feedback Calculation isn't ready yet. Just wait some seconds for the arcs to be marked.",
                    true,
                );
            } else if (this.isArcFeedbackReady && this.showArcFeedback) {
                this.collectSelectedElementsService.setArcFeedback(
                    this.selectedCutType,
                );
                this.collectSelectedElementsService.enableArcFeedback();
            } else if (this.isArcFeedbackReady && !this.showArcFeedback) {
                this.collectSelectedElementsService.setArcFeedback(
                    this.selectedCutType,
                );
            }
        } else {
            this.selectedCutType = undefined;
        }
    }
}

class ResettingSelection {
    constructor(
        private collectSelectedElementsService: CollectSelectedElementsService,
        private contextMenuService: ContextMenuService,
        private disabling: Disabling,
    ) {}

    resetSelection() {
        if (this.disabling.isResetSelectionDisabled()) return;
        this.collectSelectedElementsService.resetSelectedElements();
        this.contextMenuService.hide();
    }
}

class ShowingEventLog {
    showEventLogs: boolean = false;

    constructor(
        private applicationStateService: ApplicationStateService,
        private contextMenuService: ContextMenuService,
        private disabling: Disabling,
    ) {
        this.applicationStateService.showEventLogs$.subscribe(
            (showEventLogs) => {
                this.showEventLogs = showEventLogs;
            },
        );
    }

    buttonText(): string {
        return this.showEventLogs
            ? 'Hide Event Logs (t)'
            : 'Show Event Logs (t)';
    }

    toggleEventLogs() {
        if (this.disabling.isToggleEventLogsDisabled()) return;
        this.applicationStateService.toggleShowEventLogs();
        this.contextMenuService.hide();
    }
}

class ShowingArcFeedback {
    showArcFeedback: boolean = false;
    constructor(
        private applicationStateService: ApplicationStateService,
        private contextMenuService: ContextMenuService,
        private disabling: Disabling,
        private collectSelectedElementsService: CollectSelectedElementsService,
    ) {
        this.applicationStateService.showArcFeedback$.subscribe(
            (showArcFeedback) => {
                this.showArcFeedback = showArcFeedback;
            },
        );
    }

    buttonText(): string {
        return this.showArcFeedback
            ? 'Hide Arc Feedback (a)'
            : 'Show Arc Feedback (a)';
    }

    toggleArcFeedback() {
        if (this.disabling.isToggleFeedbackDisabled()) return;
        this.applicationStateService.toggleShowArcFeedback();
        if (this.showArcFeedback) {
            this.collectSelectedElementsService.enableArcFeedback();
        } else {
            this.collectSelectedElementsService.disableArcFeedback();
        }

        this.contextMenuService.hide();
    }
}

class DialogOpening {
    private _recentEventLogs: RecentEventLog[] = [];
    constructor(
        private matDialog: MatDialog,
        private calculateDfgService: CalculateDfgService,
        private petriNetManagementService: PetriNetManagementService,
        private contextMenuService: ContextMenuService,
        private parseXesService: ParseXesService,
        private eventLogParserService: EventLogParserService,
    ) {
        petriNetManagementService.recentEventLogs$.subscribe(
            (recentEventLogs) => {
                this._recentEventLogs = recentEventLogs;
            },
        );
    }

    private openDialog(data?: {
        eventLog: string;
        filename?: string;
    }): MatDialogRef<EventLogDialogComponent, EventLog> {
        this.contextMenuService.hide();
        const config: MatDialogConfig = { width: '800px', data: data };
        const dialogRef = this.matDialog.open<
            EventLogDialogComponent,
            MatDialogConfig,
            EventLog
        >(EventLogDialogComponent, config);

        const sub: Subscription = dialogRef.afterClosed().subscribe({
            next: (eventLog) => {
                if (!eventLog) return;
                Dfg.resetIdCount();
                const dfg: Dfg = this.calculateDfgService.calculate(eventLog);
                this.petriNetManagementService.initialize(
                    dfg,
                    eventLog.toString() === data?.eventLog
                        ? data?.filename
                        : undefined,
                );
            },
            complete: () => sub.unsubscribe(),
        });
        return dialogRef;
    }

    openEmptyDialog(): void {
        this.openDialog();
    }

    openPrefilledDialog(): void {
        this.openDialog({
            eventLog: this.petriNetManagementService.initialEventLog,
        });
    }

    fileUpload(event: any) {
        this.contextMenuService.hide();
        const file: File = event.target.files[0];
        file?.text().then((content) => {
            this.openDialog({
                eventLog: this.parseXesService.parse(content),
                filename: file?.name,
            });
        });
    }

    openFromHistory(eventLog: RecentEventLog) {
        this.contextMenuService.hide();
        Dfg.resetIdCount();
        const dfg: Dfg = this.calculateDfgService.calculate(
            this.eventLogParserService.parse(eventLog.eventLog),
        );
        this.petriNetManagementService.initialize(dfg, eventLog.name);
    }

    recentEventLogs(): RecentEventLog[] {
        return this._recentEventLogs;
    }
}

class Undoing {
    constructor(
        private petriNetManagementService: PetriNetManagementService,
        private contextMenuService: ContextMenuService,
        private disabling: Disabling,
    ) {}

    undoLastUpdate() {
        if (this.disabling.isUndoDisabled()) return;
        this.petriNetManagementService.updateToPreviousPetriNet();
        this.contextMenuService.hide();
    }
}

class Examples {
    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _calculateDfgService: CalculateDfgService,
        private _contextMenuService: ContextMenuService,
    ) {}

    public generateExclusiveExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Order'), new Activity('Confirm')]),
            new Trace([new Activity('Request')]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "Exclusive Cut Example");
    }

    generateSequenceExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('Order'),
                new Activity('Confirm'),
                new Activity('Delivery'),
            ]),
            new Trace([
                new Activity('Request'),
                new Activity('Confirm'),
                new Activity('Delivery'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "Sequence Cut Example");
    }

    public generateParallelExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Request'), new Activity('Order')]),
            new Trace([new Activity('Order'), new Activity('Request')]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "Parallel Cut Example");
    }

    generateLoopExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('Request'),
                new Activity('Process'),
                new Activity('Reject'),
                new Activity('Request'),
                new Activity('Process'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "Loop Cut Example");
    }

    public generateAOPTExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Request'), new Activity('Order')]),
            new Trace([
                new Activity('Order'),
                new Activity('Request'),
                new Activity('Confirm'),
            ]),
            new Trace([
                new Activity('Request'),
                new Activity('Confirm'),
                new Activity('Order'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "AOPT Example");
    }

    public generateFlowerExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('Request'),
                new Activity('Confirm'),
                new Activity('Request'),
                new Activity('Confirm'),
            ]),
            new Trace([
                new Activity('Request'),
                new Activity('Order'),
                new Activity('Confirm'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "Flower Model Example");
    }

    public generateFUHProcessMiningExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('SetPc'), new Activity('SetCfp')]),
            new Trace([
                new Activity('SuggestPc'),
                new Activity('SetUpCfp'),
                new Activity('SendInvites'),
                new Activity('ReceiveAnswers'),
                new Activity('FinalizePc'),
                new Activity('FinalizeCfp'),
            ]),
            new Trace([
                new Activity('SuggestPc'),
                new Activity('SendInvites'),
                new Activity('SetUpCfp'),
                new Activity('ReceiveAnswers'),
                new Activity('FinalizePc'),
                new Activity('FinalizeCfp'),
            ]),
            new Trace([
                new Activity('SuggestPc'),
                new Activity('SendInvites'),
                new Activity('ReceiveAnswers'),
                new Activity('SetUpCfp'),
                new Activity('FinalizePc'),
                new Activity('FinalizeCfp'),
            ]),
            new Trace([
                new Activity('SuggestPc'),
                new Activity('SendInvites'),
                new Activity('ReceiveAnswers'),
                new Activity('UpdateInvitees'),
                new Activity('SendInvites'),
                new Activity('ReceiveAnswers'),
                new Activity('FinalizePc'),
                new Activity('SetUpCfp'),
                new Activity('FinalizeCfp'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog, "FUH Example");
    }

    private initializePetriNet(eventLog: EventLog, name: string): void {
        Dfg.resetIdCount();
        const dfg: Dfg = this._calculateDfgService.calculate(eventLog);
        this._petriNetManagementService.initialize(dfg, name);
        this._contextMenuService.hide();
    }
}

class Exporting {
    constructor(
        private exportService: ExportService,
        private contextMenuService: ContextMenuService,
    ) {}

    exportPn() {
        this.exportService.exportPn();
        this.contextMenuService.hide();
    }

    exportJson() {
        this.exportService.exportJson();
        this.contextMenuService.hide();
    }

    exportPnml() {
        this.exportService.exportPnml();
        this.contextMenuService.hide();
    }
}

class Disabling {
    private isPetriNetEmpty: boolean = true;
    private isBasicPetriNet: boolean = false;
    private isInputPetriNet: boolean = false;
    private hasRecentEventLogs: boolean = false;
    private isArcFeedbackReady: boolean = false;
    private isElementSelected: boolean = false;

    constructor(
        readonly applicationStateService: ApplicationStateService,
        readonly petriNetManagementService: PetriNetManagementService,
        readonly collectSelectedElementsService: CollectSelectedElementsService,
    ) {
        applicationStateService.isPetriNetEmpty$.subscribe(
            (isPetriNetEmpty) => {
                this.isPetriNetEmpty = isPetriNetEmpty;
            },
        );
        applicationStateService.isBasicPetriNet$.subscribe(
            (isBasicPetriNet) => {
                this.isBasicPetriNet = isBasicPetriNet;
            },
        );
        applicationStateService.isInputPetriNet$.subscribe(
            (isInputPetriNet) => {
                this.isInputPetriNet = isInputPetriNet;
            },
        );
        petriNetManagementService.recentEventLogs$.subscribe(
            (recentEventLogs) => {
                this.hasRecentEventLogs = recentEventLogs.length !== 0;
            },
        );
        applicationStateService.isArcFeedbackReady$.subscribe(
            (isArcFeedbackReady) => {
                this.isArcFeedbackReady = isArcFeedbackReady;
            },
        );
        collectSelectedElementsService.isElementSelected$.subscribe(
            (isElementSelected) => {
                this.isElementSelected = isElementSelected;
            },
        );
    }

    isExportDisabled(): boolean {
        return this.isPetriNetEmpty || !this.isBasicPetriNet;
    }

    isResetSelectionDisabled(): boolean {
        return !this.isElementSelected;
    }

    isExecuteCutDisabled(): boolean {
        return this.isPetriNetEmpty || this.isBasicPetriNet;
    }

    isExecuteFallThroughDisabled(): boolean {
        return this.isPetriNetEmpty || this.isBasicPetriNet;
    }

    isUndoDisabled(): boolean {
        return this.isPetriNetEmpty || this.isInputPetriNet;
    }

    isToggleEventLogsDisabled(): boolean {
        return this.isPetriNetEmpty || this.isBasicPetriNet;
    }

    isToggleFeedbackDisabled(): boolean {
        // return this.isPetriNetEmpty;
        return (
            this.isPetriNetEmpty ||
            this.isBasicPetriNet ||
            !this.isArcFeedbackReady
        );
    }

    isCalculationInProgress(): boolean {
        return (
            !this.isArcFeedbackReady &&
            !this.isPetriNetEmpty &&
            !this.isBasicPetriNet
        );
    }

    isEditEventLogDisabled(): boolean {
        return this.isPetriNetEmpty;
    }

    isRecentEventLogsDisabled(): boolean {
        return !this.hasRecentEventLogs;
    }
}
