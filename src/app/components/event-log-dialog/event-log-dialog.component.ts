import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Activity } from 'src/app/classes/dfg/activities';
import { Dfg } from 'src/app/classes/dfg/dfg';
import { EventLog } from 'src/app/classes/event-log';
import { CalculateCoordinatesService } from 'src/app/services/calculate-coordinates.service';
import { CalculateDfgService } from 'src/app/services/calculate-dfg.service';
import { EventLogParserService } from 'src/app/services/event-log-parser.service';

@Component({
    selector: 'app-event-log-dialog',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './event-log-dialog.component.html',
    styleUrl: './event-log-dialog.component.css',
})
export class EventLogDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<EventLogDialogComponent, EventLog>,
        private eventLogParserService: EventLogParserService,
        private calculateDfgService: CalculateDfgService,
        private calculateCoordinatesService: CalculateCoordinatesService,
    ) {}

    public eventLogInput: string = '';

    public onOkClick(): void {
        const eventLog: EventLog = this.eventLogParserService.parse(
            this.eventLogInput,
        );
        const dfg: Dfg = this.calculateDfgService.calculate(eventLog);
        const graph =
            this.calculateCoordinatesService.calculateCoordinates(dfg);
        console.log(graph);
        this.dialogRef.close(eventLog);
    }
}
