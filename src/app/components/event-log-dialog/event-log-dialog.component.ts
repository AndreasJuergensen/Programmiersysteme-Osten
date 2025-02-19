import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventLog } from 'src/app/classes/event-log';
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
        MatTooltipModule,
    ],
    templateUrl: './event-log-dialog.component.html',
    styleUrl: './event-log-dialog.component.css',
})
export class EventLogDialogComponent implements OnInit, AfterViewInit {
    @ViewChild('dialogContent', { static: false })
    dialogContent!: ElementRef;
    @ViewChild('textarea', { static: true })
    textarea!: ElementRef<HTMLTextAreaElement>;

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
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) {}

    public fileName: string = '';

    ngOnInit(): void {
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();
        this.data && this.eventLogControl.setValue(this.data.eventLog);
    }

    ngAfterViewInit(): void {
        if (this.dialogContent && this.textarea) {
            setTimeout(() => this.adjustTextareaHeight(), 0);
        }
    }

    @HostListener('window:resize')
    onResize() {
        this.adjustTextareaHeight();
    }

    adjustTextareaHeight() {
        if (!this.dialogContent || !this.textarea) return;

        const dialogContent = this.dialogContent.nativeElement;
        const textarea = this.textarea.nativeElement;

        if (!dialogContent || !textarea) return;

        const availableHeight = dialogContent.clientHeight - 100;

        textarea.style.height = 'auto';
        const newHeight = textarea.scrollHeight;

        textarea.style.height = `${Math.min(newHeight, availableHeight)}px`;

        textarea.rows = Math.floor(newHeight / 26);

        this.cdr.detectChanges();
    }

    private validateFormControlInput(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        const input = control.value;

        if (input) {
            this.checkInput(input, control);
        }

        return null;
    }

    private checkInput(input: string, control: FormControl): void {
        clearTimeout((control as any)._validationTimeout);

        (control as any)._validationTimeout = setTimeout(() => {
            const errors: { [key: string]: boolean } = {};

            if (control.hasError('required')) {
                errors['required'] = true;
            }

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

            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
            control.markAsDirty();

            this.cdr.detectChanges();
        }, 1);
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

            this.adjustTextareaHeight();
        }
    }

    clearTextarea(textarea: HTMLTextAreaElement): void {
        this.eventLogControl.setValue('');
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();

        textarea.focus();
    }
}
