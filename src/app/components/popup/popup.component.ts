import {
    Component,
    ElementRef,
    inject,
    Inject,
    signal,
    ViewChild,
} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { EventLogDialogComponent } from '../event-log-dialog/event-log-dialog.component';
import { EventLog } from 'src/app/classes/event-log';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'popup',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './popup.component.html',
    styleUrl: './popup.component.css',
})
export class PopupComponent {
    constructor(
        private dialogRef: MatDialogRef<PopupComponent, String>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
    ) {}

    //ViewChild('popup') popup!: ElementRef;

    public dialog = inject(MatDialog);

    open() {
        this.dialog.open(Message);
    }

    close() {
        this.dialogRef.close('Popup wurde erzeugt.');
    }
}

export class Message {
    message = inject(MAT_DIALOG_DATA);
}
