import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillPersonOutboundFieldsCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000006000-backfill-person-outbound-fields.command';
import { BackfillPersonLeadsDueTodayViewCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000007000-backfill-person-leads-due-today-view.command';
import { BackfillPersonWaitingForFormCompletionViewCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000008000-backfill-person-waiting-for-form-completion-view.command';
import { BackfillPersonSuppressedLeadsViewCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000009000-backfill-person-suppressed-leads-view.command';
import { BackfillPersonReadyForCrmViewCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000010000-backfill-person-ready-for-crm-view.command';
import { BackfillPersonParkedRecycleQueueViewCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1780000011000-backfill-person-parked-recycle-queue-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillPersonOutboundFieldsCommand,
    BackfillPersonLeadsDueTodayViewCommand,
    BackfillPersonWaitingForFormCompletionViewCommand,
    BackfillPersonSuppressedLeadsViewCommand,
    BackfillPersonReadyForCrmViewCommand,
    BackfillPersonParkedRecycleQueueViewCommand,
  ],
})
export class V2_1_UpgradeVersionCommandModule {}
