import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 29) // less than 30 seconds ago
      return 'Just now';

    const intervals: { [key: string]: number } = {
      'year': 31536000,
      'month': 2592000,
      'week': 604800,
      'day': 86400,
      'hour': 3600,
      'minute': 60,
      'second': 1
    };

    let counter;
    for (const i in intervals) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0)
        return counter + ' ' + i + (counter === 1 ? '' : 's') + ' ago';
    }
    return value;
  }
}