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
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';
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

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, NgFor],
    templateUrl: './context-menu.component.html',
    styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent implements OnInit {
    @Input() visibility!: string;
    @Input() position!: { x: string; y: string };

    readonly disabling: Disabling;
    readonly exporting: Exporting;
    readonly examples: Examples;
    readonly undoing: Undoing;
    readonly dialogOpening: DialogOpening;
    readonly showingEventLog: ShowingEventLog;
    readonly resettingSelection: ResettingSelection;
    readonly executingCut: ExecutingCut;
    readonly executingFallThrough: ExecutingFallThrough;

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
            this.position = { x: position.x + 'px', y: position.y + 'px' };
        });
        this.exporting = new Exporting(exportService, contextMenuService);
        this.disabling = new Disabling(
            applicationStateService,
            petriNetManagementService,
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
        );
        this.executingCut = new ExecutingCut(
            executeCutService,
            feedbackService,
            collectSelectedElementsService,
            contextMenuService,
        );
        this.executingFallThrough = new ExecutingFallThrough(
            fallThroughHandlingService,
            contextMenuService,
        );
    }
    ngOnInit(): void {
        window.addEventListener('scroll', () => {
            if (this.visibility === 'visible') {
                this.contextMenuService.hide();
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
    constructor(
        private executeCutService: ExecuteCutService,
        private feedbackService: ShowFeedbackService,
        private collectSelectedElementsService: CollectSelectedElementsService,
        private contextMenuService: ContextMenuService,
    ) {}

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
        if (
            this.collectSelectedElementsService.currentCollectedArcsDFG ==
            undefined
        ) {
            this.feedbackService.showMessage(
                'No arc selected via the drawing area!',
                true,
                'You have to choose at least one arc the perform a cut on a dfg.',
            );
            return;
        }
        this.executeCutService.execute(
            this.collectSelectedElementsService.currentCollectedArcsDFG,
            this.collectSelectedElementsService.collectedArcs,
            cutType,
        );
        this.contextMenuService.hide();
    }
}

class ResettingSelection {
    constructor(
        private collectSelectedElementsService: CollectSelectedElementsService,
        private contextMenuService: ContextMenuService,
    ) {}

    resetSelection() {
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
        return this.showEventLogs ? 'Hide Event Logs' : 'Show Event Logs';
    }

    toggleEventLogs() {
        if (this.disabling.isToggleEventLogsDisabled()) return;
        this.applicationStateService.toggleShowEventLogs();
        this.contextMenuService.hide();
    }
}

class DialogOpening {
    private _recentEventLogs: string[] = [];
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
                this.petriNetManagementService.initialize(dfg);
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
            this.openDialog({ eventLog: this.parseXesService.parse(content) });
        });
    }

    openFromHistory(eventLog: string) {
        this.contextMenuService.hide();
        Dfg.resetIdCount();
        const dfg: Dfg = this.calculateDfgService.calculate(
            this.eventLogParserService.parse(eventLog),
        );
        this.petriNetManagementService.initialize(dfg);
    }

    recentEventLogs(): string[] {
        return this._recentEventLogs;
    }

    display(eventLog: string): string {
        if (eventLog.length <= 30) {
            return eventLog;
        }
        const suffix = '... [' + eventLog.length + ']';
        return eventLog.substring(0, 30 - suffix.length) + suffix;
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
        this.initializePetriNet(eventLog);
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
        this.initializePetriNet(eventLog);
    }

    public generateParallelExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Request'), new Activity('Order')]),
            new Trace([new Activity('Order'), new Activity('Request')]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog);
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
        this.initializePetriNet(eventLog);
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
        this.initializePetriNet(eventLog);
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
        this.initializePetriNet(eventLog);
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
        this.initializePetriNet(eventLog);
    }

    private initializePetriNet(eventLog: EventLog): void {
        Dfg.resetIdCount();
        const dfg: Dfg = this._calculateDfgService.calculate(eventLog);
        this._petriNetManagementService.initialize(dfg);
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

    constructor(
        readonly applicationStateService: ApplicationStateService,
        readonly petriNetManagementService: PetriNetManagementService,
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
    }

    isExportDisabled(): boolean {
        return this.isPetriNetEmpty || !this.isBasicPetriNet;
    }

    isResetSelectionDisabled(): boolean {
        return this.isPetriNetEmpty || this.isBasicPetriNet;
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
        return true;
    }

    isEditEventLogDisabled(): boolean {
        return this.isPetriNetEmpty;
    }

    isRecentEventLogsDisabled(): boolean {
        return !this.hasRecentEventLogs;
    }
}
