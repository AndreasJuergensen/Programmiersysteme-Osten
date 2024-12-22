import { Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
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
import { CommonModule } from '@angular/common';
import { EventLogValidationService } from 'src/app/services/event-log-validation.service';

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
        CommonModule,
    ],
    templateUrl: './event-log-dialog.component.html',
    styleUrl: './event-log-dialog.component.css',
})
export class EventLogDialogComponent implements OnInit {
    public eventLogControl = new FormControl('', {
        validators: [
            Validators.required,
            this.validateFormControlInput.bind(this),
        ],
        updateOn: 'change',
    });

    constructor(
        private dialogRef: MatDialogRef<EventLogDialogComponent, EventLog>,
        private eventLogParserService: EventLogParserService,
        private calculateDfgService: CalculateDfgService,
        private calculateCoordinatesService: CalculateCoordinatesService,
        private eventLogValidationService: EventLogValidationService,
    ) {}

    ngOnInit(): void {
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();
    }

    private validateFormControlInput(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        const input = control.value;
        if (input && !this.eventLogValidationService.validateInput(input)) {
            return { invalidInput: true };
        }
        return null;
    }

    public onOkClick(): void {
        if (this.eventLogControl.invalid) {
            return;
        }

        const eventLog: EventLog = this.eventLogParserService.parse(
            this.eventLogControl.value!,
        );
        const dfg: Dfg = this.calculateDfgService.calculate(eventLog);
        const graph =
            this.calculateCoordinatesService.calculateCoordinates(dfg);
        console.log(graph);
        this.dialogRef.close(eventLog);
    }
}
