import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface EmbeddingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  model?: string;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbedding(
    text: string,
    model = 'text-embedding-3-large',
  ): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model,
        input: text.trim(),
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error.message}`);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Split text into chunks for embedding
   */
  splitIntoChunks(
    text: string,
    options: EmbeddingOptions = {},
  ): { text: string; index: number }[] {
    const chunkSize = options.chunkSize || 512;
    const chunkOverlap = options.chunkOverlap || 50;

    const chunks: { text: string; index: number }[] = [];
    const sentences = text.split(/[.!?]\\s+/);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

      if (this.countTokens(testChunk) <= chunkSize) {
        currentChunk = testChunk;
      } else {
        if (currentChunk) {
          chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });

          // Add overlap
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-chunkOverlap);
          currentChunk = overlapWords.join(' ') + ' ' + sentence;
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push({ text: currentChunk.trim(), index: chunkIndex });
    }

    return chunks;
  }

  /**
   * Process document and create embeddings
   */
  async processDocumentForEmbedding(
    documentId: string,
    text: string,
    options: EmbeddingOptions = {},
  ): Promise<void> {
    try {
      this.logger.log(`Processing document ${documentId} for embedding`);

      const chunks = this.splitIntoChunks(text, options);

      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(
          chunk.text,
          options.model,
        );

        await this.prisma.ragEmbedding.create({
          data: {
            documentId,
            chunkIndex: chunk.index,
            chunkText: chunk.text,
            embedding,
            metadata: {
              chunkSize: chunk.text.length,
              tokenCount: this.countTokens(chunk.text),
            },
          },
        });
      }

      // Update document status
      await this.prisma.ragDocument.update({
        where: { id: documentId },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      });

      this.logger.log(
        `Successfully processed ${chunks.length} chunks for document ${documentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Document processing failed for ${documentId}: ${error.message}`,
      );

      await this.prisma.ragDocument.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Similarity search in embeddings
   */
  async similaritySearch(
    query: string,
    companyId: string,
    options: {
      limit?: number;
      threshold?: number;
      docTypes?: string[];
      storeIds?: string[];
    } = {},
  ): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      // Build SQL query with pgvector similarity search
      const whereConditions = ['d.company_id = $1'];
      const params: any[] = [companyId];
      let paramIndex = 2;

      if (options.docTypes && options.docTypes.length > 0) {
        whereConditions.push(`d.doc_type = ANY($${paramIndex})`);
        params.push(options.docTypes);
        paramIndex++;
      }

      if (options.storeIds && options.storeIds.length > 0) {
        whereConditions.push(`d.store_id = ANY($${paramIndex})`);
        params.push(options.storeIds);
        paramIndex++;
      }

      const threshold = options.threshold || 0.3;
      const limit = options.limit || 5;

      const query_sql = `
        SELECT 
          e.chunk_text,
          e.chunk_index,
          e.metadata,
          d.file_name,
          d.doc_type,
          d.id as document_id,
          (1 - (e.embedding <=> $${paramIndex})) as similarity_score
        FROM rag_embeddings e
        JOIN rag_documents d ON e.document_id = d.id
        WHERE ${whereConditions.join(' AND ')}
          AND (1 - (e.embedding <=> $${paramIndex})) > $${paramIndex + 1}
        ORDER BY e.embedding <=> $${paramIndex}
        LIMIT $${paramIndex + 2}
      `;

      params.push(queryEmbedding, threshold, limit);

      const results = await this.prisma.$queryRawUnsafe(query_sql, ...params);

      return results as any[];
    } catch (error) {
      this.logger.error(`Similarity search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete embeddings for a document
   */
  async deleteDocumentEmbeddings(documentId: string): Promise<void> {
    await this.prisma.ragEmbedding.deleteMany({
      where: { documentId },
    });
  }

  /**
   * Reindex all documents for a company
   */
  async reindexCompanyDocuments(companyId: string): Promise<void> {
    const documents = await this.prisma.ragDocument.findMany({
      where: {
        companyId,
        status: 'completed',
      },
    });

    for (const doc of documents) {
      try {
        // Delete existing embeddings
        await this.deleteDocumentEmbeddings(doc.id);

        // Mark as processing
        await this.prisma.ragDocument.update({
          where: { id: doc.id },
          data: { status: 'processing' },
        });

        // TODO: Re-extract text from document and reprocess
        this.logger.log(`Reindexing document ${doc.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to reindex document ${doc.id}: ${error.message}`,
        );
      }
    }
  }

  private countTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English, 1 token ≈ 2 characters for Japanese
    return Math.ceil(text.length / 3);
  }
}
