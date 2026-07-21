import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StorageModule } from './modules/storage/storage.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { VideosModule } from './modules/videos/videos.module';
import { KnowledgeMeetsModule } from './modules/knowledge-meets/meets.module';
import { KnowledgeSeriesModule } from './modules/knowledge-series/series.module';
import { EngagementModule } from './modules/engagement/engagement.module';
import { FeedModule } from './modules/feed/feed.module';
import { AdminModule } from './modules/admin/admin.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailModule } from './modules/mail/mail.module';
import { PushModule } from './modules/push/push.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SpeakersModule } from './modules/speakers/speakers.module';
import { QaModule } from './modules/qa/qa.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { StudioModule } from './modules/studio/studio.module';
import { MediaModule } from './modules/media/media.module';
import { AdminCmsModule } from './modules/admin-cms/admin-cms.module';
import { AiModule } from './modules/ai/ai.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import {
  appConfig,
  googleConfig,
  jwtConfig,
  mailConfig,
  pushConfig,
  aiConfig,
  searchConfig,
  storageConfig,
} from './config/configuration';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        jwtConfig,
        googleConfig,
        storageConfig,
        searchConfig,
        mailConfig,
        pushConfig,
        aiConfig,
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
    TaxonomyModule,
    VideosModule,
    KnowledgeMeetsModule,
    KnowledgeSeriesModule,
    EngagementModule,
    FeedModule,
    AdminModule,
    SearchModule,
    NotificationsModule,
    MailModule,
    PushModule,
    JobsModule,
    ProgressModule,
    SpeakersModule,
    QaModule,
    ResourcesModule,
    StudioModule,
    MediaModule,
    AdminCmsModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
