'use client';

import React from 'react';

interface EstimatePDFProps {
  estimate: {
    id: string;
    customerId: string;
    customerName: string;
    title: string;
    date: string;
    validUntil: string;
    paymentTerms: string;
    items: any[];
    overheadSettings: any;
    totals: any;
    notes?: string;
    customer?: any;
    paymentTerm?: any;
  };
}

export const EstimatePDF: React.FC<EstimatePDFProps> = ({ estimate }) => {
  return (
    <div
      id="estimate-pdf-template"
      style={{
        fontFamily:
          '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", Meiryo, sans-serif',
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        background: 'white',
        fontSize: '12px',
        lineHeight: 1.4,
        color: '#333',
        boxSizing: 'border-box',
      }}
    >
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '24px',
            margin: 0,
            color: '#2196F3',
            fontWeight: 'bold',
          }}
        >
          見積書
        </h1>
      </div>

      {/* 見積情報 */}
      <div
        style={{ textAlign: 'right', marginBottom: '20px', fontSize: '10px' }}
      >
        <div>見積番号: {estimate.id}</div>
        <div>見積日: {estimate.date}</div>
        <div>有効期限: {estimate.validUntil}</div>
      </div>

      {/* タイトル */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2
          style={{
            fontSize: '16px',
            color: '#2196F3',
            margin: 0,
            fontWeight: 'bold',
          }}
        >
          {estimate.title}
        </h2>
      </div>

      {/* 顧客情報 */}
      {estimate.customer && (
        <div style={{ marginBottom: '30px' }}>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            お客様情報
          </h3>
          <div
            style={{
              background: '#f5f5f5',
              padding: '15px',
              fontSize: '10px',
              border: '1px solid #ddd',
            }}
          >
            <div style={{ marginBottom: '5px' }}>
              {estimate.customer.name} 様
            </div>
            <div style={{ marginBottom: '5px' }}>
              電話番号: {estimate.customer.tel || '-'}
            </div>
            <div style={{ marginBottom: '5px' }}>
              メール: {estimate.customer.email || '-'}
            </div>
            <div>
              住所: {estimate.customer.prefecture || ''}
              {estimate.customer.city || ''}
              {estimate.customer.address || ''}
            </div>
          </div>
        </div>
      )}

      {/* 工事明細 */}
      <div style={{ marginBottom: '20px' }}>
        <h3
          style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}
        >
          工事明細
        </h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '9px',
            border: '1px solid #ddd',
          }}
        >
          <thead>
            <tr style={{ background: '#42A5F5', color: 'white' }}>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'left',
                }}
              >
                項目名
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                  width: '60px',
                }}
              >
                数量
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                  width: '50px',
                }}
              >
                単位
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'right',
                  width: '80px',
                }}
              >
                単価
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'right',
                  width: '80px',
                }}
              >
                金額
              </th>
            </tr>
          </thead>
          <tbody>
            {estimate.items.map((item: any, index: number) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.name}
                </td>
                <td
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {item.unit}
                </td>
                <td
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'right',
                  }}
                >
                  ¥{item.unitPrice.toLocaleString()}
                </td>
                <td
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'right',
                  }}
                >
                  ¥{item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 集計 */}
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <div
          style={{
            display: 'inline-block',
            textAlign: 'left',
            fontSize: '10px',
          }}
        >
          <div style={{ marginBottom: '3px' }}>
            小計:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.subtotal.toLocaleString()}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>
            現場管理費:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.overhead.管理費.toLocaleString()}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>
            一般管理費:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.overhead.一般管理費.toLocaleString()}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>
            諸経費:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.overhead.諸経費.toLocaleString()}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '9px', marginBottom: '8px' }}>
            廃材処分費:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.overhead.廃材処分費.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid #333',
              paddingTop: '5px',
              marginBottom: '3px',
            }}
          >
            税抜合計:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.beforeTax.toLocaleString()}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            消費税(10%):{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.tax.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              borderTop: '2px solid #333',
              paddingTop: '5px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#2196F3',
            }}
          >
            合計金額:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                textAlign: 'right',
              }}
            >
              ¥{estimate.totals.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 支払条件 */}
      {estimate.paymentTerm && (
        <div style={{ marginBottom: '10px' }}>
          <h3
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            支払条件
          </h3>
          <div style={{ fontSize: '10px' }}>
            {estimate.paymentTerm.name || '現金'}
          </div>
        </div>
      )}

      {/* 備考 */}
      {estimate.notes && (
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            備考
          </h3>
          <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {estimate.notes}
          </div>
        </div>
      )}

      {/* フッター */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          fontSize: '8px',
          color: '#999',
          borderTop: '1px solid #eee',
          paddingTop: '10px',
        }}
      >
        <div>DRM Suite - 段取り関係管理システム</div>
        <div>発行日: {new Date().toLocaleDateString('ja-JP')}</div>
      </div>
    </div>
  );
};

export default EstimatePDF;
