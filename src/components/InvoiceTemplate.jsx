import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// ═══════════════════════════════════════════════════════
// SECTION 8 FIX — Clean Quantity Parser
// Converts "10 × 2"  →  "10"
// Converts "5 x 3"   →  "5"
// Converts "15"      →  "15"
// ═══════════════════════════════════════════════════════
const cleanQuantity = (rawQty) => {
  if (rawQty === null || rawQty === undefined) return '';
  const str = String(rawQty).trim();

  // Match patterns like "10 × 2", "5 x 3", "8*4"
  const multiplicationPattern = /^(.*?)\s*[×x*]\s*.+$/;
  const match = str.match(multiplicationPattern);

  if (match) {
    return match[1].trim(); // Return only the first operand (actual quantity)
  }

  return str; // Already clean
};

// ─── Currency helper ───
const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

// ─── PDF Styles ───
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#374151',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaBox: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: 6,
  },
  table: {
    width: '100%',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
  },
  colItem: { width: '35%', paddingRight: 8 },
  colQty:   { width: '15%', textAlign: 'right', paddingRight: 8 },
  colRate:  { width: '20%', textAlign: 'right', paddingRight: 8 },
  colTotal: { width: '20%', textAlign: 'right' },
  th: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 10,
    color: '#1f2937',
  },
  tdMuted: {
    fontSize: 9,
    color: '#6b7280',
  },
  totalsBox: {
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: '50%',
  },
  totalLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 12,
    fontSize: 10,
    color: '#4b5563',
  },
  totalValue: {
    width: '40%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
});

const InvoiceTemplate = ({ job, company = {} }) => {
  if (!job) return null;

  const materials = job.materials || [];
  const labour = job.labour || [];
  const expenses = job.expenses || [];

  const materialsTotal = materials.reduce((s, m) => s + (Number(m.total) || 0), 0);
  const labourTotal = labour.reduce((s, l) => s + (Number(l.total) || 0), 0);
  const expensesTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const subTotal = materialsTotal + labourTotal + expensesTotal;
  const finalAmount = Number(job.final_amount || job.agreed_amount || subTotal);
  const profit = finalAmount - subTotal;

  const totalPaid = job.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;
  const balance = finalAmount - totalPaid;

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN');
  };

  // ─── Reusable line-item table renderer ───
  const renderLineItems = (items, type) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colItem]}>Item / Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colRate]}>Rate</Text>
          <Text style={[styles.th, styles.colTotal]}>Amount</Text>
        </View>

        {items.map((item, idx) => {
          // ╔══════════════════════════════════════════════╗
          // ║  SECTION 8 FIX APPLIED HERE                  ║
          // ║  cleanQuantity() strips "× 2" from "10 × 2"  ║
          // ╚══════════════════════════════════════════════╝
          const rawQty = type === 'expense'
            ? 1
            : (item.quantity || item.hours || 0);
          const displayQty = type === 'expense' ? '-' : cleanQuantity(rawQty);

          const name = item.name || item.description || 'Item';
          const rate = type === 'expense' ? (item.amount || 0) : (item.rate || 0);
          const total = type === 'expense' ? (item.amount || 0) : (item.total || 0);
          const unit = item.unit || (type === 'labour' ? 'hrs' : 'units');

          return (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colItem}>
                <Text style={styles.td}>{name}</Text>
                {type !== 'expense' && (
                  <Text style={styles.tdMuted}>Per {unit}</Text>
                )}
              </View>
              <Text style={[styles.td, styles.colQty]}>
                {displayQty}
              </Text>
              <Text style={[styles.td, styles.colRate]}>
                {formatCurrency(rate)}
              </Text>
              <Text style={[styles.td, styles.colTotal]}>
                {formatCurrency(total)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name || 'JobProfit'}</Text>
          <Text style={styles.invoiceTitle}>Tax Invoice</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Billed To</Text>
            <Text style={styles.metaValue}>{job.client_name || 'Client'}</Text>
            {job.client_address && (
              <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                {job.client_address}
              </Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Invoice Details</Text>
            <Text style={styles.metaValue}>
              Job: {job.job_number || job.id?.slice(0, 8)}
            </Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
              Date: {formatDate(job.invoice_date || job.created_at)}
            </Text>
            <Text style={{ fontSize: 10, color: '#4b5563' }}>
              Site: {job.site_name || job.location || '—'}
            </Text>
          </View>
        </View>

        {/* Materials */}
        {materials.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Materials</Text>
            {renderLineItems(materials, 'material')}
          </>
        )}

        {/* Labour */}
        {labour.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Labour</Text>
            {renderLineItems(labour, 'labour')}
          </>
        )}

        {/* Expenses */}
        {expenses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Expenses</Text>
            {renderLineItems(expenses, 'expense')}
          </>
        )}

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subTotal)}</Text>
          </View>
          {finalAmount !== subTotal && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Agreed / Final Amount:</Text>
              <Text style={[styles.totalValue, { color: '#1e40af' }]}>
                {formatCurrency(finalAmount)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>
              Balance Due:
            </Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Thank you for your business. For queries, contact{' '}
            {company.phone || company.email || 'us'}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
    0
