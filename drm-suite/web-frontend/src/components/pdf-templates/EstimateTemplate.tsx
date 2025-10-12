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

// 見積書データの型定義
export interface EstimateData {
  id: string;
  estimateNo: string;
  estimateDate: string;
  validUntil: string;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone?: string;
  projectName: string;
  projectType?: string;
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
  notes?: string;
  conditions?: string;
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

interface EstimateTemplateProps {
  estimate: EstimateData;
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

export const EstimateTemplate: React.FC<EstimateTemplateProps> = ({
  estimate,
  branding,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>見積書 / ESTIMATE</Text>
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

          {/* 見積先（顧客）情報 */}
          <View style={styles.customerSection}>
            <Text style={styles.infoLabel}>見積先 / Estimate To:</Text>
            <Text style={styles.companyName}>{estimate.customerCompany}</Text>
            <Text style={styles.infoValue}>{estimate.customerName} 様</Text>
            <Text style={styles.infoValue}>{estimate.customerAddress}</Text>
            {estimate.customerPhone && (
              <Text style={styles.infoValue}>
                TEL: {estimate.customerPhone}
              </Text>
            )}
          </View>
        </View>

        {/* 見積書詳細 */}
        <View style={styles.invoiceDetails}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>見積書番号:</Text>
            <Text style={styles.detailValue}>{estimate.estimateNo}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>発行日:</Text>
            <Text style={styles.detailValue}>
              {formatDate(estimate.estimateDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>有効期限:</Text>
            <Text style={styles.detailValue}>
              {formatDate(estimate.validUntil)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>件名:</Text>
            <Text style={styles.detailValue}>{estimate.projectName}</Text>
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
          {estimate.items.map((item, index) => (
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
                {formatCurrency(estimate.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                消費税 ({estimate.taxRate}%)
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(estimate.taxAmount)}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabel}>見積金額 (Total)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(estimate.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* 見積条件 */}
        {estimate.conditions && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>
              見積条件 / Terms & Conditions
            </Text>
            <Text style={styles.footerText}>{estimate.conditions}</Text>
          </View>
        )}

        {/* 備考 */}
        {estimate.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考 / Notes</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
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

export default EstimateTemplate;
