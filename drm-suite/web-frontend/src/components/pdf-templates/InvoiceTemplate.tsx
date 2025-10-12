import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// 日本語フォントを登録
Font.register({
  family: 'NotoSansJP',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.0/files/noto-sans-jp-japanese-400-normal.woff',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.0/files/noto-sans-jp-japanese-700-normal.woff',
      fontWeight: 'bold',
    },
  ],
});

// 請求書データの型定義
export interface InvoiceData {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone?: string;
  projectName: string;
  items: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  notes?: string;
}

// ブランディング情報の型定義
export interface BrandingData {
  companyName: string;
  companyNameEn?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  representative?: string;
  representativeTitle?: string;
  registrationNumber?: string;
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  logoUrl?: string;
  stampUrl?: string;
}

interface InvoiceTemplateProps {
  invoice: InvoiceData;
  branding: BrandingData;
}

// スタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'NotoSansJP',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2pt solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companySection: {
    width: '45%',
  },
  customerSection: {
    width: '45%',
    borderLeft: '1pt solid #ccc',
    paddingLeft: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 5,
  },
  invoiceDetails: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
  },
  detailValue: {
    fontSize: 10,
    width: '65%',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    backgroundColor: '#f9f9f9',
    padding: 8,
    fontSize: 9,
  },
  colCategory: {
    width: '15%',
  },
  colDescription: {
    width: '30%',
  },
  colQuantity: {
    width: '10%',
    textAlign: 'right',
  },
  colUnit: {
    width: '10%',
    textAlign: 'center',
  },
  colUnitPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colAmount: {
    width: '20%',
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryTable: {
    width: '50%',
    border: '1pt solid #333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1pt solid #ddd',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#333',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryLabel: {
    fontSize: 10,
    width: '60%',
  },
  summaryValue: {
    fontSize: 10,
    width: '40%',
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  notesSection: {
    marginTop: 20,
    padding: 10,
    border: '1pt solid #ddd',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
  },
});

// 金額フォーマット
const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('ja-JP')}`;
};

// 日付フォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  branding,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>請求書 / INVOICE</Text>
        </View>

        {/* 会社情報 & 顧客情報 */}
        <View style={styles.headerInfo}>
          {/* 発行元（自社）情報 */}
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{branding.companyName}</Text>
            {branding.companyNameEn && (
              <Text style={styles.infoValue}>{branding.companyNameEn}</Text>
            )}
            {branding.postalCode && (
              <Text style={styles.infoValue}>〒{branding.postalCode}</Text>
            )}
            {(branding.prefecture || branding.city || branding.address) && (
              <Text style={styles.infoValue}>
                {branding.prefecture}
                {branding.city}
                {branding.address}
              </Text>
            )}
            {branding.phone && (
              <Text style={styles.infoValue}>TEL: {branding.phone}</Text>
            )}
            {branding.fax && (
              <Text style={styles.infoValue}>FAX: {branding.fax}</Text>
            )}
            {branding.email && (
              <Text style={styles.infoValue}>Email: {branding.email}</Text>
            )}
            {branding.registrationNumber && (
              <Text style={styles.infoValue}>
                登録番号: {branding.registrationNumber}
              </Text>
            )}
          </View>

          {/* 請求先（顧客）情報 */}
          <View style={styles.customerSection}>
            <Text style={styles.infoLabel}>請求先 / Bill To:</Text>
            <Text style={styles.companyName}>{invoice.customerCompany}</Text>
            <Text style={styles.infoValue}>{invoice.customerName} 様</Text>
            <Text style={styles.infoValue}>{invoice.customerAddress}</Text>
            {invoice.customerPhone && (
              <Text style={styles.infoValue}>TEL: {invoice.customerPhone}</Text>
            )}
          </View>
        </View>

        {/* 請求書詳細 */}
        <View style={styles.invoiceDetails}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>請求書番号:</Text>
            <Text style={styles.detailValue}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>発行日:</Text>
            <Text style={styles.detailValue}>
              {formatDate(invoice.invoiceDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>支払期限:</Text>
            <Text style={styles.detailValue}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>件名:</Text>
            <Text style={styles.detailValue}>{invoice.projectName}</Text>
          </View>
        </View>

        {/* 明細テーブル */}
        <View style={styles.table}>
          {/* テーブルヘッダー */}
          <View style={styles.tableHeader}>
            <Text style={styles.colCategory}>分類</Text>
            <Text style={styles.colDescription}>項目</Text>
            <Text style={styles.colQuantity}>数量</Text>
            <Text style={styles.colUnit}>単位</Text>
            <Text style={styles.colUnitPrice}>単価</Text>
            <Text style={styles.colAmount}>金額</Text>
          </View>

          {/* テーブル行 */}
          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colCategory}>{item.category}</Text>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>
                {item.quantity.toLocaleString()}
              </Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colUnitPrice}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* 合計セクション */}
        <View style={styles.summarySection}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>小計 (Subtotal)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                消費税 ({invoice.taxRate}%)
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.taxAmount)}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabel}>合計 (Total)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* 支払条件 */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>お支払い方法 / Payment Terms</Text>
          <Text style={styles.footerText}>{invoice.paymentTerms}</Text>

          {/* 銀行情報 */}
          {branding.bankInfo && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.footerTitle}>振込先 / Bank Information</Text>
              <Text style={styles.footerText}>
                銀行名: {branding.bankInfo.bankName}
              </Text>
              <Text style={styles.footerText}>
                支店名: {branding.bankInfo.branchName}
              </Text>
              <Text style={styles.footerText}>
                口座種別: {branding.bankInfo.accountType}
              </Text>
              <Text style={styles.footerText}>
                口座番号: {branding.bankInfo.accountNumber}
              </Text>
              <Text style={styles.footerText}>
                口座名義: {branding.bankInfo.accountHolder}
              </Text>
            </View>
          )}
        </View>

        {/* 備考 */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考 / Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* ページ番号 */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
