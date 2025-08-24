/**
 * データウェアハウス（DW）との連携サービス
 * 受発注データの送信・受信を管理
 */

export type OrderStatus =
  | 'sent_to_dw'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'completed';
export type OrderType = 'order' | 'purchase_order' | 'change_order';

export interface DWOrder {
  id: string;
  contractId: string;
  estimateId: string;
  projectName: string;
  orderType: OrderType;

  // DW送信情報
  sentToDW: boolean;
  dwTransactionId?: string;
  sentAt?: string;

  // DWからの応答
  dwStatus: OrderStatus;
  approvedAt?: string;
  rejectedReason?: string;

  // 受発注詳細
  orderDetails: OrderDetail[];
  totalAmount: number;

  // 原価管理用
  budgetCost: number;
  actualCost: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;

  // メタ情報
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail {
  id: string;
  category: string; // 材料, 労務, 外注, 経費
  itemName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface DWResponse {
  transactionId: string;
  status: OrderStatus;
  approvedItems: string[];
  rejectedItems: { id: string; reason: string }[];
  revisedCosts: { itemId: string; revisedPrice: number }[];
  message: string;
  timestamp: string;
}

export interface CostVariance {
  itemId: string;
  itemName: string;
  budgetCost: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'over' | 'on_budget';
}

class DWIntegrationService {
  private readonly DW_API_URL =
    process.env.NEXT_PUBLIC_DW_API_URL || 'https://dw.example.com/api';

  /**
   * 受発注データをDWに送信
   */
  async sendOrderToDW(
    order: Omit<
      DWOrder,
      'dwStatus' | 'sentToDW' | 'sentAt' | 'dwTransactionId'
    >,
  ): Promise<DWOrder> {
    const dwOrder: DWOrder = {
      ...order,
      sentToDW: true,
      sentAt: new Date().toISOString(),
      dwTransactionId: `DW-${Date.now()}`,
      dwStatus: 'sent_to_dw',
    };

    try {
      // 実際の実装ではDW APIに送信
      const response = await this.mockDWApiCall('/orders/submit', {
        method: 'POST',
        body: JSON.stringify(dwOrder),
      });

      dwOrder.dwTransactionId = response.transactionId;
      dwOrder.dwStatus = 'processing';

      this.saveDWOrder(dwOrder);

      console.log(
        `Order ${order.id} sent to DW with transaction ID: ${response.transactionId}`,
      );
      return dwOrder;
    } catch (error) {
      console.error('Failed to send order to DW:', error);
      dwOrder.dwStatus = 'rejected';
      dwOrder.rejectedReason = 'DW送信エラー';
      this.saveDWOrder(dwOrder);
      throw error;
    }
  }

  /**
   * DWからの応答を処理
   */
  async processDWResponse(
    dwTransactionId: string,
    response: DWResponse,
  ): Promise<DWOrder | null> {
    const orders = await this.getDWOrders();
    const order = orders.find((o) => o.dwTransactionId === dwTransactionId);

    if (!order) {
      console.error(`Order not found for transaction ID: ${dwTransactionId}`);
      return null;
    }

    // DWからの応答を反映
    order.dwStatus = response.status;
    order.updatedAt = new Date().toISOString();

    if (response.status === 'approved') {
      order.approvedAt = response.timestamp;

      // 修正された原価情報を反映
      response.revisedCosts.forEach((revised) => {
        const detail = order.orderDetails.find((d) => d.id === revised.itemId);
        if (detail) {
          detail.unitPrice = revised.revisedPrice;
          detail.totalPrice = detail.quantity * revised.revisedPrice;
        }
      });

      // 総原価を再計算
      this.recalculateOrderCosts(order);
    } else if (response.status === 'rejected') {
      order.rejectedReason = response.message;
    }

    this.saveDWOrder(order);
    return order;
  }

  /**
   * DWから戻ってきた受発注データ一覧取得
   */
  async getDWOrders(): Promise<DWOrder[]> {
    const orders = localStorage.getItem('dw_orders');
    return orders ? JSON.parse(orders) : [];
  }

  /**
   * プロジェクト別受発注データ取得
   */
  async getOrdersByProject(contractId: string): Promise<DWOrder[]> {
    const orders = await this.getDWOrders();
    return orders.filter((order) => order.contractId === contractId);
  }

  /**
   * 原価差異分析
   */
  async analyzeCostVariance(contractId: string): Promise<CostVariance[]> {
    const orders = await this.getOrdersByProject(contractId);
    const variances: CostVariance[] = [];

    orders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const budgetCost = detail.unitPrice * detail.quantity; // 予算原価
        const actualCost = detail.totalPrice; // 実際原価
        const variance = actualCost - budgetCost;
        const variancePercent =
          budgetCost > 0 ? (variance / budgetCost) * 100 : 0;

        variances.push({
          itemId: detail.id,
          itemName: detail.itemName,
          budgetCost,
          actualCost,
          variance,
          variancePercent,
          status: variance > 0 ? 'over' : variance < 0 ? 'under' : 'on_budget',
        });
      });
    });

    return variances.sort(
      (a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent),
    );
  }

  /**
   * 工事台帳用データ生成
   */
  async generateConstructionLedger(contractId: string) {
    const orders = await this.getOrdersByProject(contractId);
    const approvedOrders = orders.filter((o) => o.dwStatus === 'approved');

    const materialCost = approvedOrders.reduce(
      (sum, order) =>
        sum +
        order.orderDetails
          .filter((d) => d.category === '材料')
          .reduce((itemSum, item) => itemSum + item.totalPrice, 0),
      0,
    );

    const laborCost = approvedOrders.reduce(
      (sum, order) =>
        sum +
        order.orderDetails
          .filter((d) => d.category === '労務')
          .reduce((itemSum, item) => itemSum + item.totalPrice, 0),
      0,
    );

    const subcontractCost = approvedOrders.reduce(
      (sum, order) =>
        sum +
        order.orderDetails
          .filter((d) => d.category === '外注')
          .reduce((itemSum, item) => itemSum + item.totalPrice, 0),
      0,
    );

    const expenseCost = approvedOrders.reduce(
      (sum, order) =>
        sum +
        order.orderDetails
          .filter((d) => d.category === '経費')
          .reduce((itemSum, item) => itemSum + item.totalPrice, 0),
      0,
    );

    return {
      contractId,
      totalActualCost: materialCost + laborCost + subcontractCost + expenseCost,
      materialCost,
      laborCost,
      subcontractCost,
      expenseCost,
      orderCount: approvedOrders.length,
      lastUpdated: new Date().toISOString(),
      orders: approvedOrders,
    };
  }

  /**
   * DW APIのモックコール（開発用）
   */
  private async mockDWApiCall(endpoint: string, options: any): Promise<any> {
    // 実際の環境では実際のDW APIを呼び出す
    await new Promise((resolve) => setTimeout(resolve, 1000)); // API呼び出しをシミュレート

    if (endpoint === '/orders/submit') {
      return {
        transactionId: `DW-${Date.now()}`,
        status: 'processing',
        message: 'Order received and processing',
      };
    }

    throw new Error('Unknown endpoint');
  }

  // プライベートメソッド
  private saveDWOrder(order: DWOrder): void {
    const orders = JSON.parse(localStorage.getItem('dw_orders') || '[]');
    const existingIndex = orders.findIndex((o: DWOrder) => o.id === order.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }

    localStorage.setItem('dw_orders', JSON.stringify(orders));
  }

  private recalculateOrderCosts(order: DWOrder): void {
    order.totalAmount = order.orderDetails.reduce(
      (sum, detail) => sum + detail.totalPrice,
      0,
    );
    order.materialCost = order.orderDetails
      .filter((d) => d.category === '材料')
      .reduce((sum, item) => sum + item.totalPrice, 0);
    order.laborCost = order.orderDetails
      .filter((d) => d.category === '労務')
      .reduce((sum, item) => sum + item.totalPrice, 0);
    order.overheadCost = order.orderDetails
      .filter((d) => d.category === '経費')
      .reduce((sum, item) => sum + item.totalPrice, 0);
    order.actualCost = order.totalAmount;
  }
}

export const dwIntegrationService = new DWIntegrationService();
