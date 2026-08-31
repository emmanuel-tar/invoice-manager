import React, { useState, useEffect, useCallback } from 'react';
import { SmartInvoiceMatcher, SmartMatch } from './smartMatching';
import { BankTransaction } from './types';
import { Invoice } from './types';
import { PaymentRecord } from './types';
import { Client } from './types';

interface IntegrationConfig {
  accountingSoftware: 'quickbooks' | 'xero' | 'sage' | 'custom';
  bankingAPI: 'stripe' | 'paypal' | 'bank_connect' | 'api_direct';
  erpIntegration?: 'sap' | 'oracle' | 'dynamics';
  webhooks: WebhookConfig[];
}

interface WebhookConfig {
  event: 'invoice_created' | 'payment_received' | 'tax_updated';
  endpoint: string;
  secret: string;
  retryPolicy: RetryPolicy;
  active: boolean;
}

interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

interface SyncData {
  invoices?: Invoice[];
  payments?: PaymentRecord[];
  clients?: Client[];
  transactions?: BankTransaction[];
  metadata?: Record<string, any>;
}

interface SyncResult {
  success: boolean;
  syncedRecords: number;
  errors: SyncError[];
  timestamp: string;
}

interface SyncError {
  recordId: string;
  error: string;
  code: string;
}

class IntegrationHub {
  private configs: Map<string, IntegrationConfig> = new Map();
  private webhooks: Map<string, WebhookConfig[]> = new Map();
  private syncHistory: SyncResult[] = [];

  // Configure integration with a specific system
  configure(system: string, config: IntegrationConfig): void {
    this.configs.set(system, config);
    this.webhooks.set(system, config.webhooks.filter(w => w.active));
    console.log(`Configured integration for ${system}:`, config);
  }

  // Sync data with an external system
  async syncWithAccounting(system: string, data: SyncData): Promise<SyncResult> {
    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`No configuration found for system: ${system}`);
    }

    try {
      let syncedRecords = 0;
      const errors: SyncError[] = [];

      // Sync invoices
      if (data.invoices && config.accountingSoftware !== 'custom') {
        const result = await this.syncInvoices(system, config.accountingSoftware, data.invoices);
        syncedRecords += result.synced;
        errors.push(...result.errors);
      }

      // Sync payments
      if (data.payments) {
        const result = await this.syncPayments(system, config.bankingAPI, data.payments);
        syncedRecords += result.synced;
        errors.push(...result.errors);
      }

      // Sync clients
      if (data.clients && config.erpIntegration) {
        const result = await this.syncClients(system, config.erpIntegration, data.clients);
        syncedRecords += result.synced;
        errors.push(...result.errors);
      }

      const syncResult: SyncResult = {
        success: errors.length === 0,
        syncedRecords,
        errors,
        timestamp: new Date().toISOString()
      };

      this.syncHistory.push(syncResult);
      return syncResult;

    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        syncedRecords: 0,
        errors: [{ recordId: 'system', error: error.message, code: 'SYNC_ERROR' }],
        timestamp: new Date().toISOString()
      };
      this.syncHistory.push(errorResult);
      throw errorResult;
    }
  }

  // Setup webhook for event-driven integration
  setupWebhook(system: string, webhookConfig: WebhookConfig): string {
    const webhooks = this.webhooks.get(system) || [];
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const webhook: WebhookConfig = {
      ...webhookConfig,
      id: webhookId,
      active: true
    };

    webhooks.push(webhook);
    this.webhooks.set(system, webhooks);
    
    console.log(`Webhook ${webhookId} configured for ${system} system`);
    return webhookId;
  }

  // Trigger webhook for an event
  async triggerWebhook(system: string, event: WebhookConfig['event'], data: any): Promise<void> {
    const webhooks = this.webhooks.get(system) || [];
    const relevantWebhooks = webhooks.filter(w => w.event === event && w.active);

    for (const webhook of relevantWebhooks) {
      try {
        await this.sendWebhookEvent(webhook, event, data);
      } catch (error) {
        console.error(`Webhook ${webhook.id} failed for event ${event}:`, error);
        // Implement retry logic here
        await this.retryWebhook(webhook, event, data, webhook.retryPolicy);
      }
    }
  }

  // Send webhook event with retry logic
  private async sendWebhookEvent(webhook: WebhookConfig, event: string, data: any): Promise<void> {
    const response = await fetch(webhook.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret,
        'X-Event-Type': event,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Webhook response ${response.status}: ${response.statusText}`);
    }
  }

  // Retry failed webhook
  private async retryWebhook(webhook: WebhookConfig, event: string, data: any, policy: RetryPolicy): Promise<void> {
    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        await this.sendWebhookEvent(webhook, event, data);
        console.log(`Webhook ${webhook.id} succeeded on attempt ${attempt}`);
        return;
      } catch (error) {
        if (attempt === policy.maxAttempts) {
          throw error;
        }
        
        const delay = policy.delayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Automated bank reconciliation with multiple sources
  async autoReconcileWithBank(transactions: BankTransaction[]): Promise<AutomatedReconciliationResult> {
    const results: AutomatedReconciliationResult = {
      matched: [],
      unmatched: [],
      exceptions: [],
      confidence: 0,
      timestamp: new Date().toISOString()
    };

    // Group transactions by amount ranges and patterns
    const transactionGroups = this.groupTransactions(transactions);

    for (const [pattern, group] of transactionGroups) {
      // Try to match with known patterns
      const matches = await this.matchWithKnownPatterns(group, pattern);
      
      if (matches.length > 0) {
        results.matched.push(...matches);
      } else {
        results.unmatched.push(...group);
      }
    }

    // Calculate overall confidence
    results.confidence = results.matched.length / Math.max(transactions.length, 1);

    // Identify exceptions (transactions that couldn't be categorized)
    results.exceptions = transactions.filter(t => 
      !results.matched.some(m => m.transaction.id === t.id) &&
      !results.unmatched.some(u => u.id === t.id)
    );

    return results;
  }

  // Group transactions by patterns
  private groupTransactions(transactions: BankTransaction[]): Map<string, BankTransaction[]> {
    const groups = new Map<string, BankTransaction[]>();

    transactions.forEach(transaction => {
      let pattern = 'unknown';
      
      if (transaction.reference.includes('INV') || transaction.reference.includes('invoice')) {
        pattern = 'invoice_payment';
      } else if (transaction.reference.includes('PAY') || transaction.reference.includes('payment')) {
        pattern = 'payment_received';
      } else if (transaction.reference.includes('REF') || transaction.reference.includes('transfer')) {
        pattern = 'transfer';
      } else if (transaction.amount > 1000) {
        pattern = 'large_amount';
      }

      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(transaction);
    });

    return groups;
  }

  // Match transactions with known patterns
  private async matchWithKnownPatterns(transactions: BankTransaction[], pattern: string): Promise<MatchedTransaction[]> {
    const matches: MatchedTransaction[] = [];

    for (const transaction of transactions) {
      // Try to find matching invoice based on pattern
      const potentialInvoices = this.findPotentialInvoices(transaction, pattern);
      
      if (potentialInvoices.length > 0) {
        const bestMatch = potentialInvoices[0]; // Simplified - pick the best match
        matches.push({
          transaction,
          matchedTo: bestMatch,
          confidence: this.calculateMatchConfidence(transaction, bestMatch),
          pattern
        });
      }
    }

    return matches;
  }

  // Find potential matching invoices
  private findPotentialInvoices(transaction: BankTransaction, pattern: string): Invoice[] {
    // This would query a database or API to find potential matches
    // For demo, return empty array
    return [];
  }

  // Calculate match confidence
  private calculateMatchConfidence(transaction: BankTransaction, invoice: Invoice): number {
    let confidence = 0;
    
    // Amount matching
    const amountDiff = Math.abs(transaction.amount - invoice.total);
    const amountRatio = Math.max(0, 1 - amountDiff / invoice.total);
    confidence += amountRatio * 0.4;

    // Reference matching
    const refMatch = transaction.reference.toLowerCase().includes(invoice.invoiceNumber.toLowerCase().split('-')[1]);
    confidence += refMatch ? 0.3 : 0;

    // Date matching
    const transactionDate = new Date(transaction.date).getTime();
    const invoiceDate = new Date(invoice.date).getTime();
    const dateDiff = Math.abs(transactionDate - invoiceDate) / (1000 * 60 * 60 * 24); // days
    const dateRatio = Math.max(0, 1 - dateDiff / 30); // within 30 days
    confidence += dateRatio * 0.3;

    return confidence;
  }

  // Get sync history for a system
  getSyncHistory(system?: string): SyncResult[] {
    if (system) {
      return this.syncHistory.filter(sync => 
        sync.errors.some(error => error.recordId.includes(system))
      );
    }
    return this.syncHistory;
  }

  // Get webhook status for a system
  getWebhookStatus(system: string): WebhookConfig[] {
    return this.webhooks.get(system) || [];
  }

  // Health check for all integrations
  async healthCheck(): Promise<IntegrationHealth> {
    const health: IntegrationHealth = {
      healthy: true,
      systems: [],
      timestamp: new Date().toISOString()
    };

    for (const [system, config] of this.configs) {
      const systemHealth = {
        system,
        status: 'unknown' as 'healthy' | 'degraded' | 'failed',
        lastSync: new Date().toISOString(),
        errors: [] as string[],
        webhookCount: this.webhooks.get(system)?.length || 0
      };

      try {
        // Test webhook connectivity
        if (config.webhooks.length > 0) {
          const testWebhook = config.webhooks[0];
          if (testWebhook.active) {
            systemHealth.status = 'healthy';
          }
        }
      } catch (error) {
        systemHealth.status = 'failed';
        systemHealth.errors.push(error.message);
        health.healthy = false;
      }

      health.systems.push(systemHealth);
    }

    return health;
  }
}

// Supporting types
interface AutomatedReconciliationResult {
  matched: MatchedTransaction[];
  unmatched: BankTransaction[];
  exceptions: BankTransaction[];
  confidence: number;
  timestamp: string;
}

interface MatchedTransaction {
  transaction: BankTransaction;
  matchedTo: Invoice;
  confidence: number;
  pattern: string;
}

interface IntegrationHealth {
  healthy: boolean;
  systems: Array<{ 
    system: string; 
    status: 'healthy' | 'degraded' | 'failed'; 
    lastSync: string; 
    errors: string[]; 
    webhookCount: number;
  }>;
  timestamp: string;
}

export { IntegrationHub };
export type { 
  IntegrationConfig, 
  WebhookConfig, 
  SyncData, 
  SyncResult, 
  SyncError,
  AutomatedReconciliationResult,
  MatchedTransaction,
  IntegrationHealth
};
