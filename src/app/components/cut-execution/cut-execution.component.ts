import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExecuteCutService } from 'src/app/services/execute-cut.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';
import { CollectArcsService } from 'src/app/services/collect-arcs.service';

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

    constructor(
        private _fb: FormBuilder,
        private _executeCutService: ExecuteCutService,
        private _feedbackService: ShowFeedbackService,
        private _petriNetManagementService: PetriNetManagementService,
        private _collectArcsService: CollectArcsService,
    ) {
        this.radioForm = this._fb.group({
            selectedCut: null,
        });
    }

    ngOnInit(): void {
        this.radioForm.get('selectedCut')?.valueChanges.subscribe(() => {});
    }

    onCutClick(): void {
        const selectedValue = this.radioForm.get('selectedCut')?.value;
        if (selectedValue && this._collectArcsService.currentDFG) {
            this._executeCutService.execute(
                this._collectArcsService.currentDFG,
                this._collectArcsService.collectedArcs,
                selectedValue,
            );
            this.resetRadioSelection();
            this._collectArcsService.resetCollectedArcs();
        } else if (!selectedValue && this._collectArcsService.currentDFG) {
            this._feedbackService.showMessage(
                'No cut selected via radio buttons!',
                true,
                'You have to choose a Cut via the radio buttons, which you want to perform on one of the DFGs.',
            );
        } else if (
            selectedValue &&
            this._collectArcsService.currentDFG == undefined
        ) {
            this._feedbackService.showMessage(
                'No arc selected via the drawing area!',
                true,
                'You have to choose at least one arc the perform a cut on a dfg.',
            );
        } else {
            this._feedbackService.showMessage(
                'No cut and no arc selected!',
                true,
                'You have to choose a Cut via the radio buttons and at least one arc via the drawing area to perform a cut on a dfg.',
            );
        }
    }

    onCancelClick(): void {
        if (this.radioForm.get('selectedCut')?.value !== null) {
            this.resetRadioSelection();
            this._collectArcsService.resetCollectedArcs();
            this._feedbackService.showMessage('Canceled cut-selection!', false);
        }
    }

    resetRadioSelection(): void {
        this.radioForm.get('selectedCut')?.setValue(null);
    }

    get actionButtonsAreDisabled(): boolean {
        return !this._petriNetManagementService.isModifiable;
    }
}
