import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { PlayListModule } from './play-list/play-list.module';
import { SongModule } from './song/song.module';
import { SongUploadModule } from './song-upload/song-upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { SearchModule } from './elasticsearch/search.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    forwardRef(() =>
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'uploads'),
        serveRoot: '/uploads/',
      }),
    ),
    AuthModule,
    PrismaModule,
    UserModule,
    PlayListModule,
    SongModule,
    SongUploadModule,
    ImageUploadModule,
    SearchModule,
  ],
})
export class AppModule {}
