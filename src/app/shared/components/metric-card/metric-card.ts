import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-metric-card',
  imports: [TuiBadge],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCard {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() hint = '';
  @Input() appearance: 'primary' | 'success' | 'warning' | 'neutral' = 'neutral';
}
