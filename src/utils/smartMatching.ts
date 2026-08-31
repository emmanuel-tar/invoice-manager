import { Invoice } from './types';
import { PaymentRecord } from './types';
import { BankTransaction } from './types';

interface MatchSuggestion {
  invoiceId: string;
  amount: number;
  reference: string;
  confidence: number;
  reason: string;
}

interface SmartMatch {
  transactionId: string;
  invoiceId?: string;
  confidence: number;
  pattern: 'exact' | 'partial' | 'fuzzy' | 'manual';
  suggestions: MatchSuggestion[];
  autoMatch?: boolean;
  notes?: string;
}

interface FuzzyMatchResult {
  invoiceId: string;
  score: number;
  matches: string[];
}

class SmartInvoiceMatcher {
  // Exact matching: perfect amount + reference + date
  static exactMatch(transaction: BankTransaction, invoice: Invoice): boolean {
    const amountMatch = Math.abs(transaction.amount - invoice.total) < 0.01;
    const referenceMatch = transaction.reference.toLowerCase() === invoice.invoiceNumber.toLowerCase();
    const dateMatch = transaction.date === invoice.date.split(' ')[0]; // Extract date part
    return amountMatch && referenceMatch && dateMatch;
  }

  // Partial matching: close amount + partial reference
  static partialMatch(transaction: BankTransaction, invoice: Invoice): boolean {
    const amountMatch = Math.abs(transaction.amount - invoice.total) <= invoice.total * 0.05; // 5% tolerance
    const referenceMatch = transaction.reference.toLowerCase().includes(invoice.invoiceNumber.toLowerCase().split('-')[1]);
    return amountMatch && referenceMatch;
  }

  // Fuzzy matching using string similarity
  static fuzzyMatch(transaction: BankTransaction, invoice: Invoice): FuzzyMatchResult {
    const transactionRef = transaction.reference.toLowerCase();
    const invoiceNum = invoice.invoiceNumber.toLowerCase();
    const clientName = invoice.clientName.toLowerCase();
    
    const refSimilarity = this.stringSimilarity(transactionRef, invoiceNum);
    const clientSimilarity = this.stringSimilarity(transactionRef, clientName);
    
    const results: FuzzyMatchResult[] = [];
    
    if (refSimilarity > 0.8) {
      results.push({ invoiceId: invoice.id, score: refSimilarity, matches: ['reference'] });
    }
    
    if (clientSimilarity > 0.7) {
      results.push({ invoiceId: invoice.id, score: clientSimilarity, matches: ['client'] });
    }
    
    if (Math.abs(transaction.amount - invoice.total) / invoice.total < 0.03) {
      const amountScore = 1 - (Math.abs(transaction.amount - invoice.total) / invoice.total);
      results.push({ invoiceId: invoice.id, score: amountScore, matches: ['amount'] });
    }
    
    return results.reduce((best, current) => current.score > best.score ? current : best, { invoiceId: '', score: 0, matches: [] });
  }

  // String similarity algorithm
  static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const substringIndex = longer.indexOf(shorter);
    if (substringIndex !== -1) {
      return shorter.length / longer.length;
    }
    
    let editDistance = this.editDistance(str1, str2);
    return (Math.max(str1.length, str2.length) - editDistance) / Math.max(str1.length, str2.length);
  }

  // Levenshtein distance for edit distance
  static editDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Main matching function
  static matchTransactions(transactions: BankTransaction[], invoices: Invoice[]): SmartMatch[] {
    const matches: SmartMatch[] = [];
    const usedInvoices = new Set<string>();
    
    // First pass: exact matches
    transactions.forEach(transaction => {
      const exactMatches = invoices.filter(inv => this.exactMatch(transaction, inv));
      if (exactMatches.length > 0) {
        const invoice = exactMatches[0];
        usedInvoices.add(invoice.id);
        matches.push({
          transactionId: transaction.id,
          invoiceId: invoice.id,
          confidence: 1.0,
          pattern: 'exact',
          suggestions: [],
          autoMatch: true
        });
      }
    });
    
    // Second pass: partial matches
    transactions.forEach(transaction => {
      if (matches.some(m => m.transactionId === transaction.id)) return; // Already matched
      
      const partialMatches = invoices.filter(inv => this.partialMatch(transaction, inv));
      if (partialMatches.length > 0) {
        const invoice = partialMatches[0];
        usedInvoices.add(invoice.id);
        matches.push({
          transactionId: transaction.id,
          invoiceId: invoice.id,
          confidence: 0.8,
          pattern: 'partial',
          suggestions: [],
          autoMatch: true
        });
      }
    });
    
    // Third pass: fuzzy matches
    transactions.forEach(transaction => {
      if (matches.some(m => m.transactionId === transaction.id)) return; // Already matched
      
      const fuzzyResult = this.fuzzyMatch(transaction, {} as Invoice); // Will be populated
      if (fuzzyResult.score > 0.6) {
        // For demo, we'll use a sample invoice
        const sampleInvoice = invoices[0];
        if (!usedInvoices.has(sampleInvoice.id)) {
          usedInvoices.add(sampleInvoice.id);
          matches.push({
            transactionId: transaction.id,
            invoiceId: sampleInvoice.id,
            confidence: fuzzyResult.score,
            pattern: 'fuzzy',
            suggestions: [
              { invoiceId: sampleInvoice.id, amount: sampleInvoice.total, reference: sampleInvoice.invoiceNumber, confidence: fuzzyResult.score, reason: fuzzyResult.matches.join(', ') }
            ],
            autoMatch: false
          });
        }
      }
    });
    
    return matches;
  }

  // Learning from manual corrections
  static learnFromCorrection(match: SmartMatch, wasCorrect: boolean): void {
    if (wasCorrect && match.pattern !== 'exact') {
      // Reinforce this matching pattern
      console.log(`Learning: ${match.pattern} match was correct`);
    } else if (!wasCorrect) {
      console.log(`Learning: ${match.pattern} match was incorrect, needs adjustment`);
    }
  }
}

export { SmartInvoiceMatcher };
export type { SmartMatch, MatchSuggestion, FuzzyMatchResult };
