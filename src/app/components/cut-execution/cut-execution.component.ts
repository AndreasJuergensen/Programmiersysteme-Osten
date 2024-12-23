import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExecuteCutService } from 'src/app/services/execute-cut.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { Dfg } from 'src/app/classes/dfg/dfg';
import { Activities } from 'src/app/classes/dfg/activities';
import { Arcs } from 'src/app/classes/dfg/arcs';
import { EventLog } from 'src/app/classes/event-log';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';

export enum CutType {
    ExclusiveCut = 'ExclusiveCut',
    SequenceCut = 'SequenceCut',
    ParallelCut = 'ParallelCut',
    LoopCut = 'LoopCut',
}

@Component({
    selector: 'app-cut-execution',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        MatRadioModule,
        MatButtonModule,
    ],
    templateUrl: './cut-execution.component.html',
    styleUrl: './cut-execution.component.css',
})
export class CutExecutionComponent implements OnInit {
    radioForm: FormGroup;
    radioOptions: string[] = [
        CutType.ExclusiveCut,
        CutType.SequenceCut,
        CutType.ParallelCut,
        CutType.LoopCut,
    ];

    dfgDummy: Dfg = new Dfg(new Activities(), new Arcs(), new EventLog());
    arcsSelectedDummy: Arcs = new Arcs();

    constructor(
        private fb: FormBuilder,
        private executeCutService: ExecuteCutService,
        private feedbackService: ShowFeedbackService,
        // private kantenSammelService: KantenSammelService
    ) {
        this.radioForm = this.fb.group({
            selectedCut: null,
        });
    }

    ngOnInit(): void {
        this.radioForm.get('selectedCut')?.valueChanges.subscribe(() => {});
    }

    onCutClick(): void {
        const selectedValue = this.radioForm.get('selectedCut')?.value;
        if (selectedValue) {
            this.executeCutService.execute(
                this.dfgDummy,
                this.arcsSelectedDummy,
                selectedValue,
            );
            this.resetRadioSelection();
        } else {
            this.feedbackService.showMessage(
                'Es wurde kein Cut ausgewählt!',
                true,
                'Sie müssen einen Cut über die Radio-Buttons auswählen, um einen Cut durchführen zu können.',
            );
        }
    }

    onCancelClick(): void {
        if (this.radioForm.get('selectedCut')?.value !== null) {
            this.resetRadioSelection();
            this.feedbackService.showMessage('Cutauswahl abgebrochen.', false);
        }
    }

    resetRadioSelection(): void {
        this.radioForm.get('selectedCut')?.setValue(null);
    }
}
