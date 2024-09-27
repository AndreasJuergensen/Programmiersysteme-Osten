import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-example-file',
    templateUrl: './example-file.component.html',
    styleUrls: ['./example-file.component.css']
})
export class ExampleFileComponent {

    public static readonly META_DATA_CODE = 'drag-file-location';

    @Input() title: string | undefined;
    @Input() description: string | undefined;
    @Input({required: true}) link: string = '';

    constructor() {
    }

    prevent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    hoverStart(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.add('mouse-hover');
    }

    hoverEnd(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.remove('mouse-hover');
    }

    addFileLink(e: DragEvent) {
        console.log('drag start', e);

        e.dataTransfer!.effectAllowed = 'link';
        e.dataTransfer!.setData(ExampleFileComponent.META_DATA_CODE, this.link);
    }

}
