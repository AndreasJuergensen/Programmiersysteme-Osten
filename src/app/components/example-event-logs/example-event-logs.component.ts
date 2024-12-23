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

    public generateEasyExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog);
    }

    public generateMediumExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog);
    }

    public generateComplexExample(): void {
        const traces: Trace[] = [
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
            new Trace([
                new Activity('U'),
                new Activity('V'),
                new Activity('W'),
                new Activity('X'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
            new Trace([
                new Activity('U'),
                new Activity('X'),
                new Activity('Z'),
                new Activity('A'),
                new Activity('C'),
            ]),
        ];
        const eventLog: EventLog = new EventLog(traces);
        this.initializePetriNet(eventLog);
    }

    private initializePetriNet(eventLog: EventLog): void {
        const dfg: Dfg = this._calculateDfgService.calculate(eventLog);
        this._petriNetManagementService.initialize(dfg);
    }
}
