import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { DrawingService } from './components/drawing-area/drawing.service';
import { Diagram, Element } from './components/drawing-area/models';
import { CalculateDfgService } from './services/calculate-dfg.service';
import { DfgCoordinateCalculatorService } from './services/dfg-coordinate-calculator.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(
        private _matDialog: MatDialog,
        private calculateDfgService: CalculateDfgService,
        private calculateDfgCoordinatesService: DfgCoordinateCalculatorService,
        private drawingService: DrawingService,
    ) {}

    public openDialog(): void {
        const config: MatDialogConfig = { width: '800px' };
        const dialogRef = this._matDialog.open<
            EventLogDialogComponent,
            MatDialogConfig,
            EventLog
        >(EventLogDialogComponent, config);

        const sub: Subscription = dialogRef.afterClosed().subscribe({
            next: (result) => {
                const dfg = this.calculateDfgService.calculate(result!);

                const graph =
                    this.calculateDfgCoordinatesService.calculate(dfg);
                // console.log(dfg);
                this.drawingService.drawGraph(graph);
            },
            complete: () => sub.unsubscribe(),
        });
    }

    public drawMyStuff(): void {
        const myDiagram = new Diagram([
            new Element('elem1', 50, 50),
            new Element('elem2', 200, 100),
        ]);
        this.drawingService.drawDiagram(myDiagram);
    }
}
