import type { AnalyticsData } from '@/types/zaplytics';

/**
 * Escape CSV field content
 */
function escapeCsvField(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCsv<T extends Record<string, unknown>>(data: T[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',') + '\n';
  }
  
  const csvRows = [
    // Header row
    headers.map(escapeCsvField).join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return escapeCsvField(
          typeof value === 'string' || typeof value === 'number' 
            ? value 
            : value?.toString() || ''
        );
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

/**
 * Trigger file download
 */
function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format date for CSV export
 */
function formatDateForCsv(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Export individual zaps to CSV
 */
export function exportZapsCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'id',
    'date',
    'timestamp',
    'amount_sats',
    'zapper_pubkey',
    'zapper_name',
    'zapper_nip05',
    'comment',
    'zapped_event_id',
    'zapped_event_kind',
    'zapped_event_author',
    'zapped_event_content_preview',
    'zapped_event_created_at'
  ];
  
  const rows = data.allZaps.map(zap => ({
    id: zap.receipt.id,
    date: formatDateForCsv(zap.receipt.created_at),
    timestamp: zap.receipt.created_at,
    amount_sats: zap.amount,
    zapper_pubkey: zap.zapper.pubkey,
    zapper_name: zap.zapper.name || '',
    zapper_nip05: zap.zapper.nip05 || '',
    comment: zap.comment || '',
    zapped_event_id: zap.zappedEvent?.id || '',
    zapped_event_kind: zap.zappedEvent?.kind || '',
    zapped_event_author: zap.zappedEvent?.author || '',
    zapped_event_content_preview: zap.zappedEvent?.content 
      ? zap.zappedEvent.content.substring(0, 100).replace(/\n/g, ' ') 
      : '',
    zapped_event_created_at: zap.zappedEvent?.created_at 
      ? formatDateForCsv(zap.zappedEvent.created_at)
      : ''
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-zaps-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export earnings by period to CSV
 */
export function exportEarningsByPeriodCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'period',
    'date',
    'total_sats',
    'zap_count',
    'average_zap_amount'
  ];
  
  const rows = data.earningsByPeriod.map(period => ({
    period: period.period,
    date: period.date.toISOString(),
    total_sats: period.totalSats,
    zap_count: period.zapCount,
    average_zap_amount: period.zapCount > 0 ? Math.round(period.totalSats / period.zapCount) : 0
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-earnings-by-period-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export top content performance to CSV
 */
export function exportTopContentCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'event_id',
    'event_kind',
    'content_preview',
    'author',
    'created_at',
    'total_sats',
    'zap_count',
    'average_zap_amount'
  ];
  
  const rows = data.topContent.map(content => ({
    event_id: content.eventId,
    event_kind: content.eventKind,
    content_preview: content.content.substring(0, 200).replace(/\n/g, ' '),
    author: content.author,
    created_at: formatDateForCsv(content.created_at),
    total_sats: content.totalSats,
    zap_count: content.zapCount,
    average_zap_amount: Math.round(content.totalSats / content.zapCount)
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-top-content-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export zapper loyalty data to CSV
 */
export function exportZapperLoyaltyCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'pubkey',
    'name',
    'zap_count',
    'total_sats',
    'average_zap_amount',
    'first_zap_date',
    'last_zap_date',
    'days_between_first_and_last',
    'average_days_between_zaps',
    'category',
    'is_regular'
  ];
  
  const rows = data.zapperLoyalty.topLoyalZappers.map(zapper => ({
    pubkey: zapper.pubkey,
    name: zapper.name || '',
    zap_count: zapper.zapCount,
    total_sats: zapper.totalSats,
    average_zap_amount: Math.round(zapper.totalSats / zapper.zapCount),
    first_zap_date: zapper.firstZapDate.toISOString(),
    last_zap_date: zapper.lastZapDate.toISOString(),
    days_between_first_and_last: zapper.daysBetweenFirstAndLast,
    average_days_between_zaps: Math.round(zapper.averageDaysBetweenZaps * 10) / 10, // 1 decimal place
    category: zapper.category,
    is_regular: zapper.isRegular
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-zapper-loyalty-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export content performance analytics to CSV
 */
export function exportContentPerformanceCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'event_id',
    'event_kind',
    'content_preview',
    'author',
    'created_at',
    'total_sats',
    'zap_count',
    'average_zap_amount',
    'time_to_first_zap_seconds',
    'time_to_first_zap_minutes',
    'peak_earnings_window_hours',
    'longevity_days',
    'virality_score_percent'
  ];
  
  const rows = data.contentPerformance.map(content => ({
    event_id: content.eventId,
    event_kind: content.eventKind,
    content_preview: content.content.substring(0, 200).replace(/\n/g, ' '),
    author: content.author,
    created_at: formatDateForCsv(content.created_at),
    total_sats: content.totalSats,
    zap_count: content.zapCount,
    average_zap_amount: content.avgZapAmount,
    time_to_first_zap_seconds: content.timeToFirstZap,
    time_to_first_zap_minutes: Math.round(content.timeToFirstZap / 60 * 10) / 10,
    peak_earnings_window_hours: content.peakEarningsWindow,
    longevity_days: Math.round(content.longevityDays * 10) / 10,
    virality_score_percent: Math.round(content.viralityScore * 10) / 10
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-content-performance-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export hashtag performance to CSV
 */
export function exportHashtagPerformanceCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'hashtag',
    'total_sats',
    'zap_count',
    'average_zap_amount',
    'post_count',
    'success_rate_percent',
    'average_time_to_first_zap_seconds'
  ];
  
  const rows = data.hashtagPerformance.map(hashtag => ({
    hashtag: hashtag.hashtag,
    total_sats: hashtag.totalSats,
    zap_count: hashtag.zapCount,
    average_zap_amount: hashtag.avgZapAmount,
    post_count: hashtag.postCount,
    success_rate_percent: Math.round(hashtag.successRate * 10) / 10,
    average_time_to_first_zap_seconds: Math.round(hashtag.avgTimeToFirstZap)
  }));
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-hashtag-performance-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}

/**
 * Export temporal patterns to CSV
 */
export function exportTemporalPatternsCsv(data: AnalyticsData, timeRange: string): void {
  // Export hourly patterns
  const hourlyHeaders = [
    'hour_24h',
    'hour_12h',
    'total_sats',
    'zap_count',
    'average_zap_amount'
  ];
  
  const hourlyRows = data.temporalPatterns.earningsByHour.map(hour => ({
    hour_24h: hour.hour,
    hour_12h: hour.hour === 0 ? '12 AM' : 
             hour.hour === 12 ? '12 PM' :
             hour.hour < 12 ? `${hour.hour} AM` : `${hour.hour - 12} PM`,
    total_sats: hour.totalSats,
    zap_count: hour.zapCount,
    average_zap_amount: hour.avgZapAmount
  }));
  
  const hourlyCsv = arrayToCsv(hourlyRows, hourlyHeaders);
  const hourlyFilename = `zaplytics-hourly-patterns-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(hourlyCsv, hourlyFilename);
  
  // Export daily patterns
  const dailyHeaders = [
    'day_of_week_number',
    'day_name',
    'total_sats',
    'zap_count',
    'average_zap_amount'
  ];
  
  const dailyRows = data.temporalPatterns.earningsByDayOfWeek.map(day => ({
    day_of_week_number: day.dayOfWeek,
    day_name: day.dayName,
    total_sats: day.totalSats,
    zap_count: day.zapCount,
    average_zap_amount: day.avgZapAmount
  }));
  
  const dailyCsv = arrayToCsv(dailyRows, dailyHeaders);
  const dailyFilename = `zaplytics-daily-patterns-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(dailyCsv, dailyFilename);
}

/**
 * Export comprehensive analytics summary to CSV
 */
export function exportSummaryCsv(data: AnalyticsData, timeRange: string): void {
  const headers = [
    'metric',
    'value',
    'unit'
  ];
  
  const rows = [
    { metric: 'Total Earnings', value: data.totalEarnings, unit: 'sats' },
    { metric: 'Total Zaps', value: data.totalZaps, unit: 'count' },
    { metric: 'Unique Zappers', value: data.uniqueZappers, unit: 'count' },
    { metric: 'Average Zap Amount', value: data.totalZaps > 0 ? Math.round(data.totalEarnings / data.totalZaps) : 0, unit: 'sats' },
    { metric: 'Time Period', value: timeRange, unit: 'period' },
    { metric: 'Export Date', value: new Date().toISOString(), unit: 'timestamp' },
    { metric: 'New Zappers', value: data.zapperLoyalty.newZappers, unit: 'count' },
    { metric: 'Returning Zappers', value: data.zapperLoyalty.returningZappers, unit: 'count' },
    { metric: 'Regular Supporters', value: data.zapperLoyalty.regularSupporters, unit: 'count' },
    { metric: 'Average Lifetime Value', value: data.zapperLoyalty.averageLifetimeValue, unit: 'sats' }
  ];
  
  const csv = arrayToCsv(rows, headers);
  const filename = `zaplytics-summary-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csv, filename);
}