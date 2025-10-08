import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Invoice } from '../route';

// 契約から請求書への自動マッピング
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { contractId } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // 1. 契約データを取得
    const contractRes = await fetch(
      `${request.nextUrl.origin}/api/contracts?id=${contractId}`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      }
    );

    if (!contractRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    const contractData = await contractRes.json();
    const contract = contractData.contract;

    // 2. 請求書データを生成
    const now = new Date();
    const invoiceDate = now.toISOString().split('T')[0];

    // 支払期限は請求日から30日後
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData: Partial<Invoice> = {
      invoiceNo: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      invoiceDate: invoiceDate,
      dueDate: dueDate.toISOString().split('T')[0],

      // 契約情報を引き継ぎ
      contractId: contract.id,
      contractNo: contract.contractNo,

      // 顧客情報
      customerName: contract.customerName,
      customerCompany: contract.customerCompany,
      customerAddress: contract.customerAddress,
      customerPhone: contract.customerPhone,
      customerEmail: contract.customerEmail,

      // プロジェクト情報
      projectName: contract.projectName,
      projectType: contract.projectType,

      // 請求項目を契約条項から生成
      items: [],

      // 金額情報
      subtotal: contract.contractAmount || 0,
      taxRate: 10,
      taxAmount: contract.taxAmount || 0,
      totalAmount: contract.totalAmount || 0,

      // 支払条件
      paymentTerms: contract.paymentTerms || '月末締め翌月末払い',
      paymentMethod: '銀行振込',

      // 振込先情報（デフォルト）
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: '株式会社サンプル建設',
      },

      // ステータス
      status: 'draft',
      paymentStatus: 'unpaid',
      paidAmount: 0,

      // 担当者
      createdBy: 'システム自動生成',
    };

    // 契約条項から請求項目を生成
    if (contract.clauses && contract.clauses.length > 0) {
      invoiceData.items = contract.clauses.map((clause: any, index: number) => ({
        id: `ITEM-${index + 1}`,
        category: '工事費',
        description: `${clause.title}: ${clause.content}`,
        quantity: 1,
        unit: '式',
        unitPrice: 0, // 契約書には詳細金額がないため、合計から按分が必要
        amount: 0,
      }));
    }

    // estimateItemsがある場合はそちらを優先
    if (contract.estimateItems && contract.estimateItems.length > 0) {
      invoiceData.items = contract.estimateItems.map((item: any, index: number) => ({
        id: `ITEM-${index + 1}`,
        category: item.category,
        description: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
      }));

      // 合計金額を再計算
      const subtotal = contract.estimateItems.reduce((sum: number, item: any) => sum + item.amount, 0);
      const taxAmount = Math.floor(subtotal * 0.1);
      invoiceData.subtotal = subtotal;
      invoiceData.taxAmount = taxAmount;
      invoiceData.totalAmount = subtotal + taxAmount;
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
      message: '契約から請求書データを生成しました',
    });
  } catch (error) {
    console.error('Error creating invoice from contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice from contract' },
      { status: 500 }
    );
  }
}
