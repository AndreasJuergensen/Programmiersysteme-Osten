import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { ExportService } from 'src/app/services/export.service';

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './context-menu.component.html',
    styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent implements OnInit {
    @Input() visibility!: string;
    @Input() position!: { x: string; y: string };

    isExportDisabled = true;

    constructor(
        private exportService: ExportService,
        private readonly contextMenuService: ContextMenuService,
    ) {
        this.exportService.isPetriNetExportable$.subscribe((isExportable) => {
            this.isExportDisabled = !isExportable;
        });
        this.contextMenuService.visibility.subscribe((visibility) => {
            this.visibility = visibility;
        });
        this.contextMenuService.position.subscribe((position) => {
            this.position = {x: position.x + "px", y: position.y + "px"};
        });
    }
    ngOnInit(): void {
        window.addEventListener('scroll', () => {
            if (this.visibility === 'visible') {
                this.closeMenu();
            }
        });
        window.addEventListener('mousedown', () => {
            if (this.visibility === 'visible') {
                this.closeMenu();
            }
        });
    }

    private closeMenu() {
        this.visibility = 'hidden';
        document.getElementById('drawing-area')?.focus();
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
