import * as lightningPayReq from 'light-bolt11-decoder';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import type { 
  ZapReceipt, 
  ParsedZap, 
  EarningsByPeriod, 
  EarningsByContent, 
  EarningsByKind, 
  ZapperStats,
  TimeRange,
  CustomDateRange
} from '@/types/zaplytics';
import { TIME_RANGES, KIND_NAMES } from '@/types/zaplytics';

/**
 * Parse a Lightning invoice to extract the amount in sats
 */
export function parseBolt11Amount(bolt11: string): number {
  try {
    const decoded = lightningPayReq.decode(bolt11);
    const amountSection = decoded.sections.find(section => section.name === 'amount');
    if (amountSection && amountSection.value) {
      // Convert from millisats to sats
      return Math.floor(Number(amountSection.value) / 1000);
    }
  } catch (error) {
    console.warn('Failed to decode bolt11:', error);
  }
  return 0;
}

/**
 * Parse a zap receipt event into a structured format
 */
export function parseZapReceipt(zapEvent: ZapReceipt): ParsedZap | null {
  try {
    // Extract bolt11 from tags
    const bolt11Tag = zapEvent.tags.find(tag => tag[0] === 'bolt11');
    if (!bolt11Tag || !bolt11Tag[1]) return null;

    const amount = parseBolt11Amount(bolt11Tag[1]);
    if (amount === 0) return null;

    // Extract zapped event info
    const eTag = zapEvent.tags.find(tag => tag[0] === 'e');
    const pTag = zapEvent.tags.find(tag => tag[0] === 'p');
    
    // Extract zap request if present
    const zapRequestDesc = zapEvent.tags.find(tag => tag[0] === 'description');
    let zapRequest: ParsedZap['zapRequest'] | undefined;
    let comment: string | undefined;

    if (zapRequestDesc && zapRequestDesc[1]) {
      try {
        const zapRequestEvent = JSON.parse(zapRequestDesc[1]);
        zapRequest = {
          pubkey: zapRequestEvent.pubkey,
          content: zapRequestEvent.content,
          created_at: zapRequestEvent.created_at,
        };
        comment = zapRequestEvent.content || undefined;
      } catch (error) {
        console.warn('Failed to parse zap request:', error);
      }
    }

    const parsedZap: ParsedZap = {
      receipt: zapEvent,
      amount,
      comment,
      zapRequest,
      zapper: {
        pubkey: zapRequest?.pubkey || zapEvent.pubkey,
      },
    };

    if (eTag && eTag[1]) {
      parsedZap.zappedEvent = {
        id: eTag[1],
        kind: 1, // Default to kind 1, will be updated when we fetch the actual event
        author: pTag?.[1] || '',
        content: '',
        created_at: 0,
      };
    }

    return parsedZap;
  } catch (error) {
    console.warn('Failed to parse zap receipt:', error);
    return null;
  }
}

/**
 * Validate if an event is a proper zap receipt
 */
export function isValidZapReceipt(event: NostrEvent): event is ZapReceipt {
  if (event.kind !== 9735) return false;
  
  // Must have bolt11 tag
  const bolt11Tag = event.tags.find(tag => tag[0] === 'bolt11');
  if (!bolt11Tag || !bolt11Tag[1]) return false;
  
  // Must have valid amount
  const amount = parseBolt11Amount(bolt11Tag[1]);
  return amount > 0;
}

/**
 * Get date range for a time period
 */
export function getDateRange(timeRange: TimeRange, customRange?: CustomDateRange): { since: number; until?: number } {
  if (timeRange === 'custom' && customRange) {
    // For custom range, use the provided dates
    const since = Math.floor(customRange.from.getTime() / 1000);
    const until = Math.floor(customRange.to.getTime() / 1000);
    return { since, until };
  }
  
  const config = TIME_RANGES[timeRange];
  const now = Math.floor(Date.now() / 1000);
  
  if (config.days === null) {
    // All time - no since filter
    return { since: 0 };
  }
  
  const since = now - (config.days * 24 * 60 * 60);
  return { since, until: now };
}

/**
 * Group zaps by time period
 */
export function groupZapsByPeriod(zaps: ParsedZap[], timeRange: TimeRange, customRange?: CustomDateRange): EarningsByPeriod[] {
  const config = TIME_RANGES[timeRange];
  const grouped = new Map<string, { totalSats: number; zapCount: number; date: Date }>();

  // For custom ranges, determine appropriate grouping based on range length
  let groupBy = config.groupBy;
  if (timeRange === 'custom' && customRange) {
    const daysDiff = Math.ceil((customRange.to.getTime() - customRange.from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 2) {
      groupBy = 'hour';
    } else if (daysDiff <= 31) {
      groupBy = 'day';
    } else if (daysDiff <= 90) {
      groupBy = 'week';
    } else {
      groupBy = 'month';
    }
  }

  zaps.forEach(zap => {
    const date = new Date(zap.receipt.created_at * 1000);
    let periodKey: string;
    let periodDate: Date;

    switch (groupBy) {
      case 'hour':
        periodKey = date.toISOString().slice(0, 13) + ':00:00.000Z'; // YYYY-MM-DDTHH
        periodDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        break;
      case 'day':
        periodKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
        periodDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        break;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        periodKey = weekStart.toISOString().slice(0, 10);
        periodDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        break;
      }
      case 'month':
        periodKey = date.toISOString().slice(0, 7); // YYYY-MM
        periodDate = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
      default:
        periodKey = date.toISOString().slice(0, 10);
        periodDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const existing = grouped.get(periodKey) || { totalSats: 0, zapCount: 0, date: periodDate };
    existing.totalSats += zap.amount;
    existing.zapCount += 1;
    grouped.set(periodKey, existing);
  });

  return Array.from(grouped.entries())
    .map(([period, stats]) => ({
      period,
      ...stats,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Group zaps by content/event
 */
export function groupZapsByContent(zaps: ParsedZap[]): EarningsByContent[] {
  const grouped = new Map<string, EarningsByContent>();

  zaps.forEach(zap => {
    if (!zap.zappedEvent) return;

    const existing = grouped.get(zap.zappedEvent.id);
    if (existing) {
      existing.totalSats += zap.amount;
      existing.zapCount += 1;
    } else {
      grouped.set(zap.zappedEvent.id, {
        eventId: zap.zappedEvent.id,
        eventKind: zap.zappedEvent.kind,
        content: zap.zappedEvent.content || '',
        author: zap.zappedEvent.author,
        totalSats: zap.amount,
        zapCount: 1,
        created_at: zap.zappedEvent.created_at,
      });
    }
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.totalSats - a.totalSats);
}

/**
 * Group zaps by event kind
 */
export function groupZapsByKind(zaps: ParsedZap[]): EarningsByKind[] {
  const grouped = new Map<number, { totalSats: number; zapCount: number }>();
  const totalSats = zaps.reduce((sum, zap) => sum + zap.amount, 0);

  zaps.forEach(zap => {
    if (!zap.zappedEvent) return;

    const kind = zap.zappedEvent.kind;
    const existing = grouped.get(kind) || { totalSats: 0, zapCount: 0 };
    existing.totalSats += zap.amount;
    existing.zapCount += 1;
    grouped.set(kind, existing);
  });

  return Array.from(grouped.entries())
    .map(([kind, stats]) => ({
      kind,
      kindName: KIND_NAMES[kind] || `Kind ${kind}`,
      totalSats: stats.totalSats,
      zapCount: stats.zapCount,
      percentage: totalSats > 0 ? (stats.totalSats / totalSats) * 100 : 0,
    }))
    .sort((a, b) => b.totalSats - a.totalSats);
}

/**
 * Get top zappers stats
 */
export function getTopZappers(zaps: ParsedZap[]): ZapperStats[] {
  const grouped = new Map<string, ZapperStats>();

  zaps.forEach(zap => {
    const existing = grouped.get(zap.zapper.pubkey);
    if (existing) {
      existing.totalSats += zap.amount;
      existing.zapCount += 1;
    } else {
      grouped.set(zap.zapper.pubkey, {
        pubkey: zap.zapper.pubkey,
        name: zap.zapper.name,
        nip05: zap.zapper.nip05,
        picture: zap.zapper.picture,
        totalSats: zap.amount,
        zapCount: 1,
      });
    }
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.totalSats - a.totalSats);
}

/**
 * Format sats amount with proper thousands separators
 */
export function formatSats(sats: number): string {
  return sats.toLocaleString();
}

/**
 * Format percentage to 1 decimal place
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Create njump links for events and profiles
 */
export function createNjumpEventLink(eventId: string): string {
  try {
    const nevent = nip19.noteEncode(eventId);
    return `https://njump.me/${nevent}`;
  } catch {
    return `https://njump.me/${eventId}`;
  }
}

export function createNjumpProfileLink(pubkey: string): string {
  try {
    const npub = nip19.npubEncode(pubkey);
    return `https://njump.me/${npub}`;
  } catch {
    return `https://njump.me/${pubkey}`;
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}