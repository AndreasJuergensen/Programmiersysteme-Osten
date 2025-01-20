import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Activity } from 'src/app/classes/dfg/activities';
import { Dfg } from 'src/app/classes/dfg/dfg';
import { EventLog, Trace } from 'src/app/classes/event-log';
import { CalculateDfgService } from 'src/app/services/calculate-dfg.service';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';

@Component({
    selector: 'app-example-event-logs',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './example-event-logs.component.html',
    styleUrl: './example-event-logs.component.css',
})
export class ExampleEventLogsComponent {
    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _calculateDfgService: CalculateDfgService,
    ) {}

    public generateExclusiveExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Order')]),
            new Trace([new Activity('Request')]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog);
    }

    generateSequenceExample(): void {
        const traces: Trace[] = [
            new Trace([new Activity('Order'), new Activity('Confirm')]),
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
            new Trace([new Activity('Order'), new Activity('Request')]),
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

    private initializePetriNet(eventLog: EventLog): void {
        Dfg.resetIdCount();
        const dfg: Dfg = this._calculateDfgService.calculate(eventLog);
        this._petriNetManagementService.initialize(dfg);
    }
}
