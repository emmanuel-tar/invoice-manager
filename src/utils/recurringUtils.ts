import { RecurringSchedule, RecurringFrequency, Invoice, LineItem, BillingPatternPreset } from '../types';

export const BILLING_PATTERN_PRESETS: BillingPatternPreset[] = [
  {
    id: 'preset-monthly-retainer',
    title: 'Monthly Dedicated Retainer',
    description: 'Fixed monthly service retainer including design, strategy, and maintenance hours.',
    frequency: 'monthly',
    paymentTermsDays: 14,
    category: 'Retainer',
    suggestedItems: [
      {
        description: 'Monthly Retainer: Design & Technical Advisory',
        qty: 1,
        unitPrice: 2500,
        taxRate: 10,
        total: 2750,
      },
      {
        description: 'Managed Cloud Infrastructure & SLA Support',
        qty: 1,
        unitPrice: 350,
        taxRate: 0,
        total: 350,
      },
    ],
  },
  {
    id: 'preset-biweekly-sprint',
    title: 'Bi-Weekly Engineering Sprint',
    description: 'Recurring bi-weekly billing for agile development sprints and code deliverables.',
    frequency: 'biweekly',
    paymentTermsDays: 7,
    category: 'Engineering',
    suggestedItems: [
      {
        description: 'Bi-Weekly Agile Sprint (40 Eng Hours)',
        qty: 40,
        unitPrice: 120,
        taxRate: 10,
        total: 5280,
      },
    ],
  },
  {
    id: 'preset-quarterly-maintenance',
    title: 'Quarterly Infrastructure & Security Audit',
    description: 'Quarterly compliance check, database optimization, and software security patch review.',
    frequency: 'quarterly',
    paymentTermsDays: 30,
    category: 'Maintenance',
    suggestedItems: [
      {
        description: 'Quarterly Security Audit & Pen-Testing',
        qty: 1,
        unitPrice: 3200,
        taxRate: 10,
        total: 3520,
      },
      {
        description: 'Database Backup & Performance Tuning',
        qty: 1,
        unitPrice: 850,
        taxRate: 10,
        total: 935,
      },
    ],
  },
  {
    id: 'preset-annual-license',
    title: 'Annual Enterprise SaaS License',
    description: 'Yearly software seat subscription and priority tier technical support.',
    frequency: 'annually',
    paymentTermsDays: 30,
    category: 'Subscription',
    suggestedItems: [
      {
        description: 'Annual Enterprise Platform License (25 Seats)',
        qty: 25,
        unitPrice: 480,
        taxRate: 8,
        total: 12960,
      },
    ],
  },
  {
    id: 'preset-weekly-advisory',
    title: 'Weekly Executive Consultation',
    description: 'Weekly scheduled advisory sessions and executive strategy coaching.',
    frequency: 'weekly',
    paymentTermsDays: 7,
    category: 'Consulting',
    suggestedItems: [
      {
        description: 'Weekly Executive Advisory Session (2h)',
        qty: 2,
        unitPrice: 300,
        taxRate: 10,
        total: 660,
      },
    ],
  },
];

/**
 * Formats a Date object or YYYY-MM-DD string into a readable label (e.g. 'Oct 24, 2026')
 */
export function formatDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Returns YYYY-MM-DD string representation of a Date
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the next billing date based on a given base date and frequency
 */
export function calculateNextBillingDate(baseDateStr: string, frequency: RecurringFrequency): string {
  const base = new Date(baseDateStr);
  const next = new Date(base);

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'annually':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return toISODateString(next);
}

/**
 * Computes the due date by adding termsDays to a billing issue date
 */
export function calculateDueDate(issueDateStr: string, paymentTermsDays: number): string {
  const issue = new Date(issueDateStr);
  const due = new Date(issue);
  due.setDate(due.getDate() + paymentTermsDays);
  return toISODateString(due);
}

/**
 * Checks whether a schedule is currently due for invoice generation
 */
export function isScheduleDue(nextBillingDateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const billingDate = new Date(nextBillingDateStr);
  billingDate.setHours(0, 0, 0, 0);

  return billingDate <= today;
}

/**
 * Calculate the monthly equivalent revenue (MRR) for a recurring schedule
 */
export function calculateMRR(total: number, frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly':
      return total * (52 / 12);
    case 'biweekly':
      return total * (26 / 12);
    case 'monthly':
      return total;
    case 'quarterly':
      return total / 3;
    case 'annually':
      return total / 12;
  }
}

/**
 * Returns human-readable label for frequency
 */
export function getFrequencyLabel(frequency: RecurringFrequency): string {
  switch (frequency) {
    case 'weekly':
      return 'Weekly (Every 7 Days)';
    case 'biweekly':
      return 'Bi-Weekly (Every 14 Days)';
    case 'monthly':
      return 'Monthly (Recurring)';
    case 'quarterly':
      return 'Quarterly (Every 3 Months)';
    case 'annually':
      return 'Annually (Every 12 Months)';
  }
}

/**
 * Generates a draft (or pending) Invoice object from a RecurringSchedule
 */
export function generateInvoiceFromSchedule(
  schedule: RecurringSchedule,
  customInvoiceNumber?: string
): { invoice: Invoice; updatedSchedule: RecurringSchedule } {
  const invoiceNum =
    customInvoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`;

  const issueDateFormatted = formatDate(schedule.nextBillingDate);
  const rawDueDate = calculateDueDate(schedule.nextBillingDate, schedule.paymentTermsDays);
  const dueDateFormatted = formatDate(rawDueDate);

  // Deep clone line items with fresh unique IDs
  const clonedItems: LineItem[] = schedule.items.map((item, index) => ({
    id: `item-gen-${Date.now()}-${index}`,
    description: item.description,
    qty: item.qty,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
    total: item.total,
  }));

  const invoice: Invoice = {
    id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    invoiceNumber: invoiceNum,
    clientName: schedule.clientName,
    clientEmail: schedule.clientEmail,
    clientAddress: schedule.clientAddress,
    clientAvatar: schedule.clientAvatar,
    date: issueDateFormatted,
    dueDate: dueDateFormatted,
    items: clonedItems,
    subtotal: schedule.subtotal,
    taxAmount: schedule.taxAmount,
    discount: schedule.discount,
    total: schedule.total,
    status: schedule.autoSend ? 'pending' : 'draft',
    notes: schedule.notes
      ? `${schedule.notes}\n[Generated from recurring schedule: ${schedule.title}]`
      : `Generated automatically from recurring schedule "${schedule.title}".`,
    estimateRef: `SCHED-${schedule.id.slice(-4).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  // Calculate next billing cycle date
  const nextCycleDate = calculateNextBillingDate(schedule.nextBillingDate, schedule.frequency);

  const updatedSchedule: RecurringSchedule = {
    ...schedule,
    nextBillingDate: nextCycleDate,
    lastGeneratedDate: toISODateString(new Date()),
    generatedInvoicesCount: schedule.generatedInvoicesCount + 1,
  };

  return { invoice, updatedSchedule };
}
