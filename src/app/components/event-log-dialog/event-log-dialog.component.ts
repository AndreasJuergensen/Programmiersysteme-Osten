import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EventLog } from 'src/app/classes/event-log';
import { EventLogParserService } from 'src/app/services/event-log-parser.service';
import { CommonModule } from '@angular/common';
import { EventLogValidationService } from 'src/app/services/event-log-validation.service';
import { ParseXesService } from 'src/app/services/parse-xes.service';

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
        MatTooltipModule,
        MatIcon,
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
        private eventLogValidationService: EventLogValidationService,
        private parseXesService: ParseXesService,
        private cdr: ChangeDetectorRef,
    ) {}

    public fileName: string = '';

    ngOnInit(): void {
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();
    }

    private validateFormControlInput(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        const input = control.value;

        // if (
        //     input &&
        //     /[0-9]+[\*{1}][^\*^0-9]+|[^\*^0-9]+[\*{1}][0-9]+/.test(input)
        // ) {
        //     console.log('regex1');

        //     return { multiplicityRegEx: true };
        // }

        // if (input && input.includes('*')) {
        //     return { multiplicityRegEx: true };
        // }
        // if (input) {
        //     setTimeout(() => {
        //         if (!this.eventLogValidationService.validateInput(input)) {
        //             control.setErrors({ invalidInput: true });
        //         }
        //     }, 0);
        // }
        // if (input) {
        //     console.log('regex2');
        //     this.debounceValidation(input, control);
        // }

        if (input) {
            console.log('regex2');
            this.validateLargeInput(input, control);
        }

        return null;
    }

    private debounceValidation(input: string, control: FormControl): void {
        clearTimeout((control as any)._validationTimeout);

        (control as any)._validationTimeout = setTimeout(() => {
            const currentErrors = control.errors || {};
            const errors = { ...currentErrors };

            // Validate input with validEventLogPattern
            if (!this.eventLogValidationService.validateInput(input)) {
                errors['invalidInput'] = true;
            } else {
                delete errors['invalidInput'];
            }

            // Validate input with multiplicityPattern
            if (
                this.eventLogValidationService.checkForMultiplicityPattern(
                    input,
                )
            ) {
                errors['multiplicityRegEx'] = true;
            } else {
                delete errors['multiplicityRegEx'];
            }

            // Update errors only if there is a change
            const hasErrors = Object.keys(errors).length > 0;
            if (hasErrors) {
                control.setErrors(errors);
            } else if (control.errors) {
                control.setErrors(null);
            }
        }, 300); // Debounce time
    }

    private validateLargeInput(input: string, control: FormControl): void {
        clearTimeout((control as any)._validationTimeout);

        // let hasError = false;
        (control as any)._validationTimeout = setTimeout(() => {
            // const chunkSize = 1000; // Number of characters per chunk
            // const chunks =
            //     input.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
            const errors: { [key: string]: boolean } = {};
            // const currentErrors = control.errors || {};
            // const errors = { ...currentErrors };
            // console.log(errors);

            // Preserve required error if it exists
            if (control.hasError('required')) {
                errors['required'] = true;
            }

            // let isInvalid = false;
            // let hasMultiplicityError = false;

            /*
            for (const chunk of chunks) {
                console.log('for');

                if (!this.eventLogValidationService.validateInput(chunk)) {
                    console.log('validate');
                    isInvalid = true;
                    // hasError = true;
                    break; // Stop further validation on the first error
                }
            }

            for (const chunk of chunks) {
                if (
                    this.eventLogValidationService.checkForMultiplicityPattern(
                        chunk,
                    )
                ) {
                    console.log('***');
                    hasMultiplicityError = true;
                    // hasError = true;
                    break; // Stop further validation on the first error
                }
            }
                */

            const isValid = this.eventLogValidationService.validateInput(input);
            const hasMultiplicityError =
                this.eventLogValidationService.checkForMultiplicityPattern(
                    input,
                );

            if (!isValid) {
                errors['invalidInput'] = true;
            }

            if (hasMultiplicityError) {
                errors['multiplicityRegEx'] = true;
            }

            // Ensure we are not overwriting 'required' error
            // if (currentErrors.hasOwnProperty('required')) {
            //     delete errors['required'];
            // }

            // Set errors based on the results
            // const hasErrors = Object.keys(errors).length > 0;
            // if (Object.keys(errors).length > 0) {
            //     console.log('error sets');
            //     control.markAsDirty();
            //     control.setErrors(errors);

            //     console.log(errors);
            // } else {
            //     control.setErrors(null);
            // }

            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
            control.markAsDirty();

            this.cdr.detectChanges();
        }, 300); // Debounce time
    }

    private isValidInput(input: string): boolean {
        // Optimized validation for large inputs
        try {
            return this.eventLogValidationService.validateInput(input);
        } catch (error) {
            console.error('Validation error:', error);
            return false; // Or handle the error as needed
        }
    }

    private checkMultiplicity(input: string): boolean {
        try {
            return this.eventLogValidationService.checkForMultiplicityPattern(
                input,
            );
        } catch (error) {
            console.error('Multiplicity check error:', error);
            return true; // Or handle the error as needed (e.g., return false)
        }
    }

    public onOkClick(): void {
        if (this.eventLogControl.invalid) {
            return;
        }

        const eventLog: EventLog = this.eventLogParserService.parse(
            this.eventLogControl.value!,
        );

        this.dialogRef.close(eventLog);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (this.eventLogControl.valid) {
                this.onOkClick();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const textarea = event.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const value = textarea.value;
            textarea.value =
                value.substring(0, start) + '\n' + value.substring(end);

            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    }

    clearTextarea(textarea: HTMLTextAreaElement): void {
        this.eventLogControl.setValue('');
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();

        textarea.focus();
    }
    public onFileSelected(event: any): void {
        const file: File = event.target.files[0];

        if (file) {
            this.fileName = file.name;
            file.text().then((content) => {
                this.eventLogControl.setValue(
                    this.parseXesService.parse(content),
                );
            });
        }
    }
}
