import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchIndex(index: string, input_body: any, scroll?: string | 0 | -1) {
    try {
      const body = await this.elasticsearchService.search({
        index,
        body: input_body,
      });
      return body;
    } catch (error) {
      throw error;
    }
  }

  async addDocument(index: string, id: string, body: any) {
    return await this.elasticsearchService.index({
      index,
      id,
      body,
    });
  }

  async updateDocument(index: string, id: string, body: any) {
    return await this.elasticsearchService.update({
      index,
      id,
      body: {
        doc: body,
      },
    });
  }

  async deleteDocument(index: string, id: string) {
    return await this.elasticsearchService.delete({
      index,
      id,
    });
  }

  async deleteMultipleDocuments(indexName: string, documentIds: string[]) {
    const body = {
      query: {
        terms: {
          _id: documentIds,
        },
      },
    };

    const response = await this.elasticsearchService.deleteByQuery({
      index: indexName,
      body,
    });

    return response;
  }
}
