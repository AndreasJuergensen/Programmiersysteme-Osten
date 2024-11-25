import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExecuteCutService } from 'src/app/services/execute-cut.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

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
        'ExclusiveCut',
        'SequenceCut',
        'ParallelCut',
        'LoopCut',
    ];

    constructor(
        private fb: FormBuilder,
        private executeCutService: ExecuteCutService,
    ) {
        this.radioForm = this.fb.group({
            selectedCut: [null],
        });
    }

    ngOnInit(): void {
        this.radioForm.get('selectedCut')?.valueChanges.subscribe((value) => {
            console.log('Radio Button Selected:', value); // Optionale Debug-Ausgabe
        });
    }

    public onCutClick(): void {
        const selectedValue = this.radioForm.get('selectedCut')?.value;
        if (selectedValue) {
            this.executeCutService.cut(selectedValue);
        } else {
            console.warn('No option selected!');
        }
    }
}
