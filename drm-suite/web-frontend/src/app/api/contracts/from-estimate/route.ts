import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Contract } from '../route';

// 見積から契約への自動マッピング
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { estimateId } = await request.json();

    if (!estimateId) {
      return NextResponse.json(
        { success: false, error: 'Estimate ID is required' },
        { status: 400 },
      );
    }

    // 1. workflow-settings を取得
    const workflowSettingsRes = await fetch(
      `${request.nextUrl.origin}/api/admin/workflow-settings`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      },
    );

    if (!workflowSettingsRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch workflow settings' },
        { status: 500 },
      );
    }

    const workflowData = await workflowSettingsRes.json();
    const settings = workflowData.settings;

    // 2. 見積データを取得（LocalStorageから取得する想定）
    // 実際はAPIから取得するが、ここではモックデータで代用
    const estimate = {
      id: estimateId,
      estimateNo: `EST-2024-${estimateId}`,
      projectName: 'サンプルプロジェクト',
      projectType: '建設工事',
      customerId: 'CUST-001', // Phase 10: 顧客ID
      customerName: '山田太郎',
      customerCompany: '山田建設株式会社',
      customerAddress: '東京都渋谷区1-2-3',
      customerPhone: '03-1234-5678',
      customerEmail: 'yamada@example.com',
      totalAmount: 10000000,
      taxAmount: 1000000,
      duration: 90,
      items: [
        {
          category: '基礎工事',
          name: '掘削工事',
          quantity: 1,
          unit: '式',
          unitPrice: 2000000,
          amount: 2000000,
        },
        {
          category: '躯体工事',
          name: '鉄筋コンクリート工事',
          quantity: 100,
          unit: 'm2',
          unitPrice: 50000,
          amount: 5000000,
        },
        {
          category: '仕上工事',
          name: '内装工事',
          quantity: 1,
          unit: '式',
          unitPrice: 3000000,
          amount: 3000000,
        },
      ],
    };

    // 3. 自動マッピング実行
    const now = new Date();
    const contractData: Partial<Contract> = {
      estimateId: estimate.id,
      estimateNo: estimate.estimateNo,
      contractNo: `CON-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
        Math.random() * 1000,
      )
        .toString()
        .padStart(3, '0')}`,
      contractDate: now.toISOString().split('T')[0],
      projectName: estimate.projectName,
      projectType: estimate.projectType,
      contractType: settings.defaultContractTemplate || 'construction',
      status: 'draft',
    };

    // マッピング設定に応じて項目をコピー
    if (settings.mapCustomerInfoToContract) {
      contractData.customerId = estimate.customerId; // Phase 10: 顧客IDを継承
      contractData.customerName = estimate.customerName;
      contractData.customerCompany = estimate.customerCompany;
      contractData.customerAddress = estimate.customerAddress;
      contractData.customerPhone = estimate.customerPhone;
      contractData.customerEmail = estimate.customerEmail;
    }

    if (settings.mapAmountToContract) {
      contractData.contractAmount = estimate.totalAmount;
      contractData.taxAmount = estimate.taxAmount;
      contractData.totalAmount = estimate.totalAmount + estimate.taxAmount;
    }

    if (settings.mapDurationToContract) {
      contractData.startDate = now.toISOString().split('T')[0];
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + estimate.duration);
      contractData.endDate = endDate.toISOString().split('T')[0];
      contractData.duration = estimate.duration;
    }

    if (settings.mapEstimateItemsToContract) {
      // 見積項目を契約条項に変換
      contractData.clauses = estimate.items.map((item, index) => ({
        title: `第${index + 1}条 ${item.category}`,
        content: `${item.name}（${item.quantity}${item.unit}、単価${item.unitPrice.toLocaleString()}円）：${item.amount.toLocaleString()}円`,
      }));

      // 見積の詳細項目も保存（発注時に使用）
      contractData.estimateItems = estimate.items.map((item: any) => ({
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        notes: item.notes || '',
      }));
    }

    // 承認フロー設定
    if (settings.requireApprovalForConversion) {
      contractData.approvalStatus = 'pending';
      contractData.approvalFlowId = settings.approvalFlowId;
    }

    // 支払条件（デフォルト）
    contractData.paymentTerms = '工事完成後30日以内';

    return NextResponse.json({
      success: true,
      contract: contractData,
      settings: {
        autoConvertEnabled: settings.autoConvertEnabled,
        requireApproval: settings.requireApprovalForConversion,
        mappedFields: {
          customerInfo: settings.mapCustomerInfoToContract,
          amount: settings.mapAmountToContract,
          duration: settings.mapDurationToContract,
          items: settings.mapEstimateItemsToContract,
        },
      },
      message: '見積から契約データを生成しました',
    });
  } catch (error) {
    console.error('Error creating contract from estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contract from estimate' },
      { status: 500 },
    );
  }
}
