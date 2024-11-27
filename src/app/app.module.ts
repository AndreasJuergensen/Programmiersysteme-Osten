import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './components/footer/footer.component';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { DrawingAreaModule } from './components/drawing-area/drawing-area.module';
import { FormsModule } from '@angular/forms';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TriggerPopupComponent } from './components/trigger-popup/trigger-popup.component';

@NgModule({
    declarations: [AppComponent, FooterComponent],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        DrawingAreaModule,
        MatSnackBarModule,
        FormsModule,
        FeedbackFormComponent,
        MatDialogModule,
        TriggerPopupComponent,
    ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation],
        },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AppModule {}
