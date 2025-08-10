import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { DocumentProcessorService } from './document-processor.service';

@Module({
  imports: [ConfigModule],
  providers: [EmbeddingService, DocumentProcessorService],
  exports: [EmbeddingService, DocumentProcessorService],
})
export class RagModule {}
