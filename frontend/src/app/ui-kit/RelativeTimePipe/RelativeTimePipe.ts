import {Pipe, PipeTransform} from '@angular/core';
import {DateTime} from 'luxon';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {
  transform = (value: unknown): unknown => DateTime.fromSeconds(value as number / 1000).toRelative();
}
