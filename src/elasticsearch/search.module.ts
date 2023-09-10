import { Module,Global } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Global()
@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ES_SEARCH_NODE,
    }),
  ],
  providers: [SearchService],
  exports: [SearchService]
})
export class SearchModule {}
