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

// 発注書データの型定義
export interface OrderData {
  id: string;
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  deliveryAddress?: string;
  supplierName: string;
  supplierCompany: string;
  supplierAddress: string;
  supplierPhone?: string;
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
  paymentTerms?: string;
  deliveryTerms?: string;
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

interface OrderTemplateProps {
  order: OrderData;
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

export const OrderTemplate: React.FC<OrderTemplateProps> = ({
  order,
  branding,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>発注書 / PURCHASE ORDER</Text>
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

          {/* 発注先（協力会社）情報 */}
          <View style={styles.customerSection}>
            <Text style={styles.infoLabel}>発注先 / Supplier:</Text>
            <Text style={styles.companyName}>{order.supplierCompany}</Text>
            <Text style={styles.infoValue}>{order.supplierName} 様</Text>
            <Text style={styles.infoValue}>{order.supplierAddress}</Text>
            {order.supplierPhone && (
              <Text style={styles.infoValue}>TEL: {order.supplierPhone}</Text>
            )}
          </View>
        </View>

        {/* 発注書詳細 */}
        <View style={styles.invoiceDetails}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>発注書番号:</Text>
            <Text style={styles.detailValue}>{order.orderNo}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>発注日:</Text>
            <Text style={styles.detailValue}>
              {formatDate(order.orderDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>納期:</Text>
            <Text style={styles.detailValue}>
              {formatDate(order.deliveryDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>件名:</Text>
            <Text style={styles.detailValue}>{order.projectName}</Text>
          </View>
          {order.deliveryAddress && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>納入場所:</Text>
              <Text style={styles.detailValue}>{order.deliveryAddress}</Text>
            </View>
          )}
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
          {order.items.map((item, index) => (
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
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>消費税 ({order.taxRate}%)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.taxAmount)}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabel}>発注金額 (Total)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* 納品条件 */}
        {order.deliveryTerms && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>納品条件 / Delivery Terms</Text>
            <Text style={styles.footerText}>{order.deliveryTerms}</Text>
          </View>
        )}

        {/* 支払条件 */}
        {order.paymentTerms && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>支払条件 / Payment Terms</Text>
            <Text style={styles.footerText}>{order.paymentTerms}</Text>
          </View>
        )}

        {/* 備考 */}
        {order.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考 / Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
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

export default OrderTemplate;
