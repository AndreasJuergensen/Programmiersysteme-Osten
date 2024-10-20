import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventLog } from 'src/app/classes/event-log';

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
    ) {}
    public eventLogInput: string = '';

    public onOkClick(): void {
        const eventLog: EventLog = { traces: [] };
        this.dialogRef.close(eventLog);
    }
}
