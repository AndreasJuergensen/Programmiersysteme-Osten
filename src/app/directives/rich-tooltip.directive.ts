import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    Renderer2,
} from '@angular/core';

@Directive({
    selector: '[richTooltip]',
    standalone: true,
})
export class RichTooltipDirective {
    @Input('richTooltip') content!: string;
    @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

    private tooltip!: HTMLElement;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) {}

    @HostListener('mouseenter')
    onMouseEnter() {
        if (!this.tooltip) {
            this.showTooltip();
        }
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hideTooltip();
    }

    private showTooltip() {
        this.tooltip = this.renderer.createElement('div');
        this.tooltip.classList.add('rich-tooltip');
        this.tooltip.innerHTML = this.content; // Inject the HTML content

        this.renderer.appendChild(document.body, this.tooltip);

        const hostPos = this.el.nativeElement.getBoundingClientRect();
        const tooltipPos = this.tooltip.getBoundingClientRect();

        const top =
            this.position === 'top'
                ? hostPos.top - tooltipPos.height
                : this.position === 'bottom'
                  ? hostPos.bottom
                  : hostPos.top + hostPos.height / 2 - tooltipPos.height / 2;

        const left =
            this.position === 'left'
                ? hostPos.left - tooltipPos.width
                : this.position === 'right'
                  ? hostPos.right
                  : hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;

        this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
        this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
        this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    }

    private hideTooltip() {
        if (this.tooltip) {
            this.renderer.removeChild(document.body, this.tooltip);
            this.tooltip = null!;
        }
    }
}
