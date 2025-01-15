import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExportService } from 'src/app/services/export.service';

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './context-menu.component.html',
    styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent {
    @Input() visibility!: string;
    @Input() position!: { x: string; y: string };

    isExportDisabled = true;

    constructor(private exportService: ExportService) {
        this.exportService.isPetriNetExportable$.subscribe((isExportable) => {
            this.isExportDisabled = !isExportable;
        });
    }

    private closeMenu() {
        this.visibility = 'hidden';
    }
        

    exportPn() {
        this.exportService.exportPn();
        this.closeMenu();
    }

    exportJson() {
        this.exportService.exportJson();
        this.closeMenu();
    }

    exportPnml() {
        this.exportService.exportPnml();
        this.closeMenu();
    }
}
