import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBarRef,
} from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-custom-snackbar-popup',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './custom-snackbar-popup.component.html',
    styleUrl: './custom-snackbar-popup.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class CustomSnackbarPopupComponent {
    constructor(
        public snackBarRef: MatSnackBarRef<CustomSnackbarPopupComponent>,
        @Inject(MAT_SNACK_BAR_DATA)
        public data: { message: string; isError: boolean },
    ) {}
}
