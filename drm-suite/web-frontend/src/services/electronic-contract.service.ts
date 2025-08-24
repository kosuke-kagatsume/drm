/**
 * 電子契約サービス連携
 * 対応サービス: CloudSign, GMOサイン, DocuSign
 */

export type ElectronicContractProvider = 'cloudsign' | 'gmosign' | 'docusign';

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  templateType: 'construction' | 'renovation' | 'maintenance' | 'design';
  provider: ElectronicContractProvider;
  templateId: string; // 各サービスでのテンプレートID
  fields: ContractField[];
  signaturePositions: SignaturePosition[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'signature';
  required: boolean;
  placeholder?: string;
  options?: string[]; // dropdown用
  mapping: string; // 見積データのどのフィールドからマッピングするか
}

export interface SignaturePosition {
  id: string;
  signerType: 'contractor' | 'client' | 'witness';
  signerName: string;
  signerEmail?: string;
  signatureType: 'electronic' | 'stamp' | 'handwritten';
  required: boolean;
  order: number; // 署名順序
}

export interface ElectronicContract {
  id: string;
  title: string;
  status:
    | 'draft'
    | 'sent'
    | 'in_progress'
    | 'completed'
    | 'expired'
    | 'cancelled';
  provider: ElectronicContractProvider;
  providerContractId: string;
  templateId: string;
  estimateId?: string;
  contractData: Record<string, any>;
  signers: ContractSigner[];
  documentUrl?: string;
  completedAt?: string;
  expiresAt?: string;
  webhookEvents: WebhookEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractSigner {
  id: string;
  name: string;
  email: string;
  role: 'contractor' | 'client' | 'witness';
  status: 'pending' | 'sent' | 'opened' | 'signed' | 'declined';
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface WebhookEvent {
  id: string;
  event: 'sent' | 'opened' | 'signed' | 'completed' | 'expired' | 'declined';
  timestamp: string;
  signerEmail?: string;
  metadata?: Record<string, any>;
}

export interface CreateContractRequest {
  templateId: string;
  title: string;
  contractData: Record<string, any>;
  signers: Omit<
    ContractSigner,
    'id' | 'status' | 'signedAt' | 'ipAddress' | 'userAgent'
  >[];
  expiresAt?: string;
  message?: string;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
}

class ElectronicContractService {
  private configs: Record<ElectronicContractProvider, ProviderConfig> = {
    cloudsign: {
      apiKey: process.env.NEXT_PUBLIC_CLOUDSIGN_API_KEY || '',
      baseUrl: 'https://api.cloudsign.jp',
      webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/cloudsign',
    },
    gmosign: {
      apiKey: process.env.NEXT_PUBLIC_GMOSIGN_API_KEY || '',
      baseUrl: 'https://api.gmosign.com',
      clientId: process.env.NEXT_PUBLIC_GMOSIGN_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GMOSIGN_CLIENT_SECRET,
      webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/gmosign',
    },
    docusign: {
      apiKey: process.env.NEXT_PUBLIC_DOCUSIGN_API_KEY || '',
      baseUrl: 'https://demo.docusign.net/restapi',
      clientId: process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_SECRET,
      webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/docusign',
    },
  };

  /**
   * 電子契約を作成して送信
   */
  async createAndSendContract(
    provider: ElectronicContractProvider,
    request: CreateContractRequest,
  ): Promise<ElectronicContract> {
    console.log(`Creating contract with ${provider}:`, request);

    // デモ実装（実際のAPIコール）
    switch (provider) {
      case 'cloudsign':
        return this.createCloudSignContract(request);
      case 'gmosign':
        return this.createGMOSignContract(request);
      case 'docusign':
        return this.createDocuSignContract(request);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * CloudSign連携
   */
  private async createCloudSignContract(
    request: CreateContractRequest,
  ): Promise<ElectronicContract> {
    const config = this.configs.cloudsign;

    // 実際のAPIコール（デモ用にモック）
    const mockResponse = {
      document_id: `cs_${Date.now()}`,
      title: request.title,
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    const contract: ElectronicContract = {
      id: `contract_${Date.now()}`,
      title: request.title,
      status: 'sent',
      provider: 'cloudsign',
      providerContractId: mockResponse.document_id,
      templateId: request.templateId,
      contractData: request.contractData,
      signers: request.signers.map((signer, index) => ({
        ...signer,
        id: `signer_${index}`,
        status: 'sent',
      })),
      webhookEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
    };

    // LocalStorageに保存（デモ用）
    this.saveContract(contract);

    return contract;
  }

  /**
   * GMOサイン連携
   */
  private async createGMOSignContract(
    request: CreateContractRequest,
  ): Promise<ElectronicContract> {
    const config = this.configs.gmosign;

    // 実際のAPIコール（デモ用にモック）
    const mockResponse = {
      contract_id: `gmo_${Date.now()}`,
      title: request.title,
      status: 'preparing',
      created_at: new Date().toISOString(),
    };

    const contract: ElectronicContract = {
      id: `contract_${Date.now()}`,
      title: request.title,
      status: 'sent',
      provider: 'gmosign',
      providerContractId: mockResponse.contract_id,
      templateId: request.templateId,
      contractData: request.contractData,
      signers: request.signers.map((signer, index) => ({
        ...signer,
        id: `signer_${index}`,
        status: 'sent',
      })),
      webhookEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
    };

    this.saveContract(contract);
    return contract;
  }

  /**
   * DocuSign連携
   */
  private async createDocuSignContract(
    request: CreateContractRequest,
  ): Promise<ElectronicContract> {
    const config = this.configs.docusign;

    // 実際のAPIコール（デモ用にモック）
    const mockResponse = {
      envelopeId: `ds_${Date.now()}`,
      status: 'sent',
      sentDateTime: new Date().toISOString(),
    };

    const contract: ElectronicContract = {
      id: `contract_${Date.now()}`,
      title: request.title,
      status: 'sent',
      provider: 'docusign',
      providerContractId: mockResponse.envelopeId,
      templateId: request.templateId,
      contractData: request.contractData,
      signers: request.signers.map((signer, index) => ({
        ...signer,
        id: `signer_${index}`,
        status: 'sent',
      })),
      webhookEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
    };

    this.saveContract(contract);
    return contract;
  }

  /**
   * 契約ステータス取得
   */
  async getContractStatus(
    provider: ElectronicContractProvider,
    providerContractId: string,
  ): Promise<ElectronicContract | null> {
    const contracts = this.getStoredContracts();
    return (
      contracts.find(
        (c) =>
          c.provider === provider &&
          c.providerContractId === providerContractId,
      ) || null
    );
  }

  /**
   * 契約一覧取得
   */
  async getContracts(): Promise<ElectronicContract[]> {
    return this.getStoredContracts();
  }

  /**
   * 契約キャンセル
   */
  async cancelContract(
    provider: ElectronicContractProvider,
    providerContractId: string,
  ): Promise<boolean> {
    console.log(`Cancelling contract ${providerContractId} on ${provider}`);

    const contracts = this.getStoredContracts();
    const contractIndex = contracts.findIndex(
      (c) =>
        c.provider === provider && c.providerContractId === providerContractId,
    );

    if (contractIndex >= 0) {
      contracts[contractIndex].status = 'cancelled';
      contracts[contractIndex].updatedAt = new Date().toISOString();
      this.saveContracts(contracts);
      return true;
    }

    return false;
  }

  /**
   * Webhook処理
   */
  async processWebhook(
    provider: ElectronicContractProvider,
    payload: any,
  ): Promise<void> {
    console.log(`Processing webhook from ${provider}:`, payload);

    const contracts = this.getStoredContracts();
    let contract: ElectronicContract | undefined;

    // プロバイダーごとのWebhook処理
    switch (provider) {
      case 'cloudsign':
        contract = contracts.find(
          (c) => c.providerContractId === payload.document_id,
        );
        if (contract) {
          this.updateContractFromCloudSignWebhook(contract, payload);
        }
        break;
      case 'gmosign':
        contract = contracts.find(
          (c) => c.providerContractId === payload.contract_id,
        );
        if (contract) {
          this.updateContractFromGMOSignWebhook(contract, payload);
        }
        break;
      case 'docusign':
        contract = contracts.find(
          (c) => c.providerContractId === payload.envelopeId,
        );
        if (contract) {
          this.updateContractFromDocuSignWebhook(contract, payload);
        }
        break;
    }

    if (contract) {
      this.saveContracts(contracts);
    }
  }

  /**
   * 契約テンプレート管理
   */
  async getTemplates(): Promise<ContractTemplate[]> {
    const templates = localStorage.getItem('contract_templates');
    return templates ? JSON.parse(templates) : this.getDefaultTemplates();
  }

  async saveTemplate(template: ContractTemplate): Promise<void> {
    const templates = await this.getTemplates();
    const existingIndex = templates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem('contract_templates', JSON.stringify(templates));
  }

  // プライベートメソッド
  private saveContract(contract: ElectronicContract): void {
    const contracts = this.getStoredContracts();
    contracts.push(contract);
    this.saveContracts(contracts);
  }

  private getStoredContracts(): ElectronicContract[] {
    const contracts = localStorage.getItem('electronic_contracts');
    return contracts ? JSON.parse(contracts) : [];
  }

  private saveContracts(contracts: ElectronicContract[]): void {
    localStorage.setItem('electronic_contracts', JSON.stringify(contracts));
  }

  private updateContractFromCloudSignWebhook(
    contract: ElectronicContract,
    payload: any,
  ): void {
    // CloudSignのWebhookペイロードに応じて更新
    contract.status = this.mapCloudSignStatus(payload.status);
    contract.updatedAt = new Date().toISOString();

    contract.webhookEvents.push({
      id: `event_${Date.now()}`,
      event: payload.event,
      timestamp: new Date().toISOString(),
      metadata: payload,
    });
  }

  private updateContractFromGMOSignWebhook(
    contract: ElectronicContract,
    payload: any,
  ): void {
    // GMOサインのWebhookペイロードに応じて更新
    contract.status = this.mapGMOSignStatus(payload.status);
    contract.updatedAt = new Date().toISOString();
  }

  private updateContractFromDocuSignWebhook(
    contract: ElectronicContract,
    payload: any,
  ): void {
    // DocuSignのWebhookペイロードに応じて更新
    contract.status = this.mapDocuSignStatus(payload.status);
    contract.updatedAt = new Date().toISOString();
  }

  private mapCloudSignStatus(status: string): ElectronicContract['status'] {
    const statusMap: Record<string, ElectronicContract['status']> = {
      draft: 'draft',
      sent: 'sent',
      opened: 'in_progress',
      completed: 'completed',
      expired: 'expired',
      cancelled: 'cancelled',
    };
    return statusMap[status] || 'draft';
  }

  private mapGMOSignStatus(status: string): ElectronicContract['status'] {
    const statusMap: Record<string, ElectronicContract['status']> = {
      preparing: 'draft',
      sending: 'sent',
      in_progress: 'in_progress',
      completed: 'completed',
      expired: 'expired',
      cancelled: 'cancelled',
    };
    return statusMap[status] || 'draft';
  }

  private mapDocuSignStatus(status: string): ElectronicContract['status'] {
    const statusMap: Record<string, ElectronicContract['status']> = {
      created: 'draft',
      sent: 'sent',
      delivered: 'in_progress',
      completed: 'completed',
      declined: 'cancelled',
      voided: 'cancelled',
    };
    return statusMap[status] || 'draft';
  }

  private getDefaultTemplates(): ContractTemplate[] {
    return [
      {
        id: 'template_construction_01',
        name: '建設工事請負契約書',
        description: '一般的な建設工事用の契約書テンプレート',
        templateType: 'construction',
        provider: 'cloudsign',
        templateId: 'cs_construction_template_001',
        fields: [
          {
            id: 'project_name',
            name: '工事名称',
            type: 'text',
            required: true,
            mapping: 'projectName',
          },
          {
            id: 'contract_amount',
            name: '契約金額',
            type: 'number',
            required: true,
            mapping: 'amount',
          },
          {
            id: 'work_period_start',
            name: '工期開始日',
            type: 'date',
            required: true,
            mapping: 'startDate',
          },
          {
            id: 'work_period_end',
            name: '工期終了日',
            type: 'date',
            required: true,
            mapping: 'endDate',
          },
        ],
        signaturePositions: [
          {
            id: 'contractor_signature',
            signerType: 'contractor',
            signerName: '請負者',
            signatureType: 'electronic',
            required: true,
            order: 1,
          },
          {
            id: 'client_signature',
            signerType: 'client',
            signerName: '発注者',
            signatureType: 'electronic',
            required: true,
            order: 2,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  }
}

export const electronicContractService = new ElectronicContractService();
