/**
 * 請求書管理サービス
 * 建設業界の分割請求（着手金・中間金・精算金）に対応
 */

export type InvoiceType = 'upfront' | 'progress' | 'final' | 'change_order';
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'overdue'
  | 'cancelled';
export type PaymentMethod =
  | 'bank_transfer'
  | 'check'
  | 'cash'
  | 'card'
  | 'electronic';

export interface Invoice {
  id: string;
  invoiceNo: string;
  contractId?: string;
  estimateId?: string;
  projectName: string;
  customer: string;
  customerCompany?: string;
  customerEmail?: string;
  customerAddress?: string;

  // 請求情報
  type: InvoiceType;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issuedDate: string;
  dueDate: string;

  // ステータス
  status: InvoiceStatus;
  paidDate?: string;
  paidAmount: number;
  paymentMethod?: PaymentMethod;

  // 建設業固有の情報
  workProgress?: number; // 工事進捗率(%)
  completedMilestones: string[]; // 完了したマイルストーン
  nextMilestone?: string; // 次のマイルストーン
  retentionAmount?: number; // 留保金額

  // 請求項目
  items: InvoiceItem[];

  // メタ情報
  notes?: string;
  attachments: string[];
  emailLog: EmailLog[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  taxRate: number;
  category?: string;
}

export interface EmailLog {
  id: string;
  sentAt: string;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  openedAt?: string;
}

export interface BillingSchedule {
  id: string;
  contractId: string;
  projectName: string;
  totalAmount: number;
  schedules: BillingMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface BillingMilestone {
  id: string;
  name: string;
  type: InvoiceType;
  percentage: number; // 全体に対する割合(%)
  amount: number;
  dueDate: string;
  condition: string; // 請求条件
  status: 'pending' | 'ready' | 'invoiced' | 'paid';
  invoiceId?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: InvoiceType;
  items: Omit<InvoiceItem, 'id' | 'amount'>[];
  terms: string; // 支払条件
  notes: string;
  createdAt: string;
}

class InvoiceService {
  /**
   * 契約から請求スケジュールを自動生成
   */
  async createBillingScheduleFromContract(
    contractId: string,
    contractAmount: number,
    projectName: string,
    startDate: string,
    endDate: string,
  ): Promise<BillingSchedule> {
    // 建設業標準の請求スケジュール
    const defaultSchedule: Omit<BillingMilestone, 'id' | 'amount'>[] = [
      {
        name: '着手金',
        type: 'upfront',
        percentage: 30,
        dueDate: startDate,
        condition: '契約締結時',
        status: 'ready',
      },
      {
        name: '中間金（上棟時）',
        type: 'progress',
        percentage: 40,
        dueDate: this.addDays(startDate, 45), // 着工から45日後
        condition: '上棟完了時',
        status: 'pending',
      },
      {
        name: '精算金',
        type: 'final',
        percentage: 30,
        dueDate: endDate,
        condition: '工事完了・引き渡し時',
        status: 'pending',
      },
    ];

    const schedule: BillingSchedule = {
      id: `schedule_${Date.now()}`,
      contractId,
      projectName,
      totalAmount: contractAmount,
      schedules: defaultSchedule.map((s, index) => ({
        ...s,
        id: `milestone_${index}`,
        amount: Math.round((contractAmount * s.percentage) / 100),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveBillingSchedule(schedule);
    return schedule;
  }

  /**
   * 請求書作成
   */
  async createInvoice(
    scheduleId: string,
    milestoneId: string,
    additionalData?: Partial<Invoice>,
  ): Promise<Invoice> {
    const schedule = await this.getBillingSchedule(scheduleId);
    if (!schedule) throw new Error('請求スケジュールが見つかりません');

    const milestone = schedule.schedules.find((s) => s.id === milestoneId);
    if (!milestone) throw new Error('マイルストーンが見つかりません');

    const invoiceNo = this.generateInvoiceNumber(milestone.type);
    const taxAmount = Math.round(milestone.amount * 0.1); // 10%消費税

    const invoice: Invoice = {
      id: `invoice_${Date.now()}`,
      invoiceNo,
      contractId: schedule.contractId,
      projectName: schedule.projectName,
      customer: additionalData?.customer || '',
      customerCompany: additionalData?.customerCompany,
      type: milestone.type,
      amount: milestone.amount,
      taxAmount,
      totalAmount: milestone.amount + taxAmount,
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: milestone.dueDate,
      status: 'draft',
      paidAmount: 0,
      items: this.generateInvoiceItems(milestone),
      completedMilestones: [],
      attachments: [],
      emailLog: [],
      createdBy: additionalData?.createdBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData,
    };

    this.saveInvoice(invoice);

    // マイルストーンのステータスを更新
    milestone.status = 'invoiced';
    milestone.invoiceId = invoice.id;
    this.saveBillingSchedule(schedule);

    return invoice;
  }

  /**
   * 請求書一覧取得
   */
  async getInvoices(): Promise<Invoice[]> {
    const invoices = localStorage.getItem('invoices');
    return invoices ? JSON.parse(invoices) : [];
  }

  /**
   * 請求書取得
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    return invoices.find((inv) => inv.id === invoiceId) || null;
  }

  /**
   * 請求書更新
   */
  async updateInvoice(
    invoiceId: string,
    updates: Partial<Invoice>,
  ): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const index = invoices.findIndex((inv) => inv.id === invoiceId);

    if (index === -1) throw new Error('請求書が見つかりません');

    invoices[index] = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveInvoices(invoices);
    return invoices[index];
  }

  /**
   * 入金処理
   */
  async recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paidDate: string,
    notes?: string,
  ): Promise<Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('請求書が見つかりません');

    const newPaidAmount = invoice.paidAmount + amount;
    const isFullyPaid = newPaidAmount >= invoice.totalAmount;

    const updatedInvoice = await this.updateInvoice(invoiceId, {
      paidAmount: newPaidAmount,
      status: isFullyPaid ? 'paid' : invoice.status,
      paidDate: isFullyPaid ? paidDate : invoice.paidDate,
      paymentMethod: isFullyPaid ? paymentMethod : invoice.paymentMethod,
      notes: notes ? `${invoice.notes || ''}\n${notes}` : invoice.notes,
    });

    // 次のマイルストーンを有効化
    if (isFullyPaid) {
      await this.activateNextMilestone(invoice.contractId!, invoice.type);
    }

    return updatedInvoice;
  }

  /**
   * 工事進捗に基づく請求書生成
   */
  async generateProgressInvoice(
    contractId: string,
    workProgress: number,
    completedMilestones: string[],
  ): Promise<Invoice[]> {
    const schedule = await this.getBillingScheduleByContract(contractId);
    if (!schedule) return [];

    const readyMilestones = schedule.schedules.filter(
      (s) => s.status === 'ready' && !s.invoiceId,
    );

    const invoices: Invoice[] = [];

    for (const milestone of readyMilestones) {
      if (
        this.shouldGenerateInvoice(milestone, workProgress, completedMilestones)
      ) {
        const invoice = await this.createInvoice(schedule.id, milestone.id, {
          workProgress,
          completedMilestones,
        });
        invoices.push(invoice);
      }
    }

    return invoices;
  }

  /**
   * 請求書PDF生成
   */
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('請求書が見つかりません');

    // PDF生成ロジック（実際にはPDF生成ライブラリを使用）
    console.log('Generating PDF for invoice:', invoice.invoiceNo);

    // モックURLを返す
    return `data:application/pdf;base64,${btoa('PDF content for ' + invoice.invoiceNo)}`;
  }

  /**
   * 請求書送信
   */
  async sendInvoice(
    invoiceId: string,
    recipientEmail: string,
  ): Promise<boolean> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('請求書が見つかりません');

    // メール送信ロジック（実際にはメール送信サービスを使用）
    console.log(`Sending invoice ${invoice.invoiceNo} to ${recipientEmail}`);

    const emailLog: EmailLog = {
      id: `email_${Date.now()}`,
      sentAt: new Date().toISOString(),
      recipientEmail,
      subject: `【請求書】${invoice.projectName} - ${invoice.invoiceNo}`,
      status: 'sent',
    };

    await this.updateInvoice(invoiceId, {
      status: 'sent',
      emailLog: [...invoice.emailLog, emailLog],
    });

    return true;
  }

  /**
   * 請求書テンプレート管理
   */
  async getInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    const templates = localStorage.getItem('invoice_templates');
    return templates ? JSON.parse(templates) : this.getDefaultTemplates();
  }

  // プライベートメソッド
  private saveInvoice(invoice: Invoice): void {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    this.saveInvoices(invoices);
  }

  private saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }

  private saveBillingSchedule(schedule: BillingSchedule): void {
    const schedules = JSON.parse(
      localStorage.getItem('billing_schedules') || '[]',
    );
    const existingIndex = schedules.findIndex(
      (s: BillingSchedule) => s.id === schedule.id,
    );

    if (existingIndex >= 0) {
      schedules[existingIndex] = schedule;
    } else {
      schedules.push(schedule);
    }

    localStorage.setItem('billing_schedules', JSON.stringify(schedules));
  }

  private async getBillingSchedule(
    scheduleId: string,
  ): Promise<BillingSchedule | null> {
    const schedules = JSON.parse(
      localStorage.getItem('billing_schedules') || '[]',
    );
    return schedules.find((s: BillingSchedule) => s.id === scheduleId) || null;
  }

  private async getBillingScheduleByContract(
    contractId: string,
  ): Promise<BillingSchedule | null> {
    const schedules = JSON.parse(
      localStorage.getItem('billing_schedules') || '[]',
    );
    return (
      schedules.find((s: BillingSchedule) => s.contractId === contractId) ||
      null
    );
  }

  private generateInvoiceNumber(type: InvoiceType): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const typePrefix = {
      upfront: 'UP',
      progress: 'PR',
      final: 'FI',
      change_order: 'CO',
    }[type];

    const sequence = String(Date.now()).slice(-4);
    return `${typePrefix}-${year}${month}-${sequence}`;
  }

  private generateInvoiceItems(milestone: BillingMilestone): InvoiceItem[] {
    return [
      {
        id: 'item_1',
        description: `${milestone.name}（${milestone.condition}）`,
        quantity: 1,
        unit: '式',
        unitPrice: milestone.amount,
        amount: milestone.amount,
        taxRate: 10,
        category: milestone.type,
      },
    ];
  }

  private shouldGenerateInvoice(
    milestone: BillingMilestone,
    workProgress: number,
    completedMilestones: string[],
  ): boolean {
    switch (milestone.type) {
      case 'upfront':
        return true; // 着手金は常に請求可能
      case 'progress':
        return workProgress >= 50 || completedMilestones.includes('上棟');
      case 'final':
        return workProgress >= 90 || completedMilestones.includes('完工');
      default:
        return false;
    }
  }

  private async activateNextMilestone(
    contractId: string,
    currentType: InvoiceType,
  ): Promise<void> {
    const schedule = await this.getBillingScheduleByContract(contractId);
    if (!schedule) return;

    const typeOrder: InvoiceType[] = ['upfront', 'progress', 'final'];
    const currentIndex = typeOrder.indexOf(currentType);
    const nextType = typeOrder[currentIndex + 1];

    if (nextType) {
      const nextMilestone = schedule.schedules.find((s) => s.type === nextType);
      if (nextMilestone && nextMilestone.status === 'pending') {
        nextMilestone.status = 'ready';
        this.saveBillingSchedule(schedule);
      }
    }
  }

  private addDays(date: string, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  private getDefaultTemplates(): InvoiceTemplate[] {
    return [
      {
        id: 'template_upfront',
        name: '着手金請求書',
        type: 'upfront',
        items: [
          {
            description: '着手金（契約締結時）',
            quantity: 1,
            unit: '式',
            unitPrice: 0,
            taxRate: 10,
          },
        ],
        terms: '請求日より30日以内にお支払いください',
        notes: '契約締結に伴う着手金の請求書です。',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template_progress',
        name: '中間金請求書',
        type: 'progress',
        items: [
          {
            description: '中間金（上棟完了時）',
            quantity: 1,
            unit: '式',
            unitPrice: 0,
            taxRate: 10,
          },
        ],
        terms: '請求日より30日以内にお支払いください',
        notes: '工事進捗に応じた中間金の請求書です。',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template_final',
        name: '精算金請求書',
        type: 'final',
        items: [
          {
            description: '精算金（工事完了・引き渡し時）',
            quantity: 1,
            unit: '式',
            unitPrice: 0,
            taxRate: 10,
          },
        ],
        terms: '引き渡し時にお支払いください',
        notes: '工事完了に伴う精算金の請求書です。',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export const invoiceService = new InvoiceService();
