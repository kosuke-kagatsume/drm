import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { EmbeddingService } from './embedding.service';
import * as pdf from 'pdf-parse';
import * as fs from 'fs';
import * as csv from 'csv-parser';

export interface DocumentProcessingResult {
  documentId: string;
  chunksCreated: number;
  status: 'completed' | 'failed';
  error?: string;
}

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Process uploaded document and create embeddings
   */
  async processDocument(
    documentId: string,
    filePath: string,
  ): Promise<DocumentProcessingResult> {
    try {
      this.logger.log(`Processing document ${documentId} at ${filePath}`);

      const document = await this.prisma.ragDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Update status to processing
      await this.prisma.ragDocument.update({
        where: { id: documentId },
        data: { status: 'processing' },
      });

      let extractedText: string;

      // Extract text based on document type
      switch (document.docType) {
        case 'estimate_pdf':
        case 'cost_pdf':
        case 'contract_pdf':
          extractedText = await this.extractPdfText(filePath);
          break;
        case 'inventory_csv':
          extractedText = await this.extractCsvText(filePath);
          break;
        case 'manual_md':
          extractedText = await this.extractMarkdownText(filePath);
          break;
        default:
          throw new Error(`Unsupported document type: ${document.docType}`);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content extracted from document');
      }

      // Process text and create embeddings
      await this.embeddingService.processDocumentForEmbedding(
        documentId,
        extractedText,
        {
          chunkSize: 512,
          chunkOverlap: 50,
        },
      );

      const chunksCount = await this.prisma.ragEmbedding.count({
        where: { documentId },
      });

      this.logger.log(
        `Successfully processed document ${documentId} with ${chunksCount} chunks`,
      );

      return {
        documentId,
        chunksCreated: chunksCount,
        status: 'completed',
      };
    } catch (error) {
      this.logger.error(
        `Document processing failed for ${documentId}: ${error.message}`,
      );

      await this.prisma.ragDocument.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });

      return {
        documentId,
        chunksCreated: 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractPdfText(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      let text = data.text;

      // Clean up common PDF artifacts
      text = text
        .replace(/\s+/g, ' ') // Replace multiple whitespaces
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

      return text;
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from CSV files
   */
  private async extractCsvText(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          try {
            // Convert CSV data to searchable text
            const headers = Object.keys(rows[0] || {});
            let text = `テーブル項目: ${headers.join(', ')}\n\n`;

            rows.forEach((row, index) => {
              const rowText = headers
                .map((header) => `${header}: ${row[header] || ''}`)
                .join(', ');
              text += `行${index + 1}: ${rowText}\n`;
            });

            resolve(text);
          } catch (error) {
            reject(new Error('Failed to process CSV data'));
          }
        })
        .on('error', (error) => {
          reject(new Error(`CSV reading failed: ${error.message}`));
        });
    });
  }

  /**
   * Extract text from Markdown files
   */
  private async extractMarkdownText(filePath: string): Promise<string> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Remove markdown syntax but keep structure
      const text = content
        .replace(/#{1,6}\s*/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/```[\\s\\S]*?```/g, '[コードブロック]') // Replace code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/^\s*[-*+]\s+/gm, '• ') // Convert bullet points
        .replace(/^\s*\d+\.\s+/gm, '• '); // Convert numbered lists

      return text.trim();
    } catch (error) {
      this.logger.error(`Markdown extraction failed: ${error.message}`);
      throw new Error('Failed to extract text from Markdown');
    }
  }

  /**
   * Get processing status for a document
   */
  async getProcessingStatus(documentId: string): Promise<{
    status: string;
    chunksCreated?: number;
    errorMessage?: string;
  }> {
    const document = await this.prisma.ragDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const chunksCount = await this.prisma.ragEmbedding.count({
      where: { documentId },
    });

    return {
      status: document.status,
      chunksCreated: chunksCount,
    };
  }

  /**
   * Schedule document for reprocessing
   */
  async scheduleReprocessing(documentId: string): Promise<void> {
    // Delete existing embeddings
    await this.embeddingService.deleteDocumentEmbeddings(documentId);

    // Reset status to pending
    await this.prisma.ragDocument.update({
      where: { id: documentId },
      data: {
        status: 'pending',
        processedAt: null,
      },
    });

    this.logger.log(`Document ${documentId} scheduled for reprocessing`);
  }
}
