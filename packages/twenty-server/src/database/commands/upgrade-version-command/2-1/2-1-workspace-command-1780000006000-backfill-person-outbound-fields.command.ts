import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

type WorkspaceFlatEntityMaps = Awaited<
  ReturnType<WorkspaceCacheService['getOrRecompute']>
>;
type FlatFieldMetadataMaps = WorkspaceFlatEntityMaps['flatFieldMetadataMaps'];
type FlatViewMaps = WorkspaceFlatEntityMaps['flatViewMaps'];
type FlatViewFieldMaps = WorkspaceFlatEntityMaps['flatViewFieldMaps'];

const PERSON_OUTBOUND_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.fields.currentState.universalIdentifier,
  STANDARD_OBJECTS.person.fields.nextActionType.universalIdentifier,
  STANDARD_OBJECTS.person.fields.nextActionDate.universalIdentifier,
  STANDARD_OBJECTS.person.fields.parkedUntil.universalIdentifier,
  STANDARD_OBJECTS.person.fields.formStatus.universalIdentifier,
  STANDARD_OBJECTS.person.fields.crmStatus.universalIdentifier,
  STANDARD_OBJECTS.person.fields.isSuppressed.universalIdentifier,
  STANDARD_OBJECTS.person.fields.suppressionReason.universalIdentifier,
  STANDARD_OBJECTS.person.fields.sendingMailboxId.universalIdentifier,
] as const;

const PERSON_MINIMAL_VIEW_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.universalIdentifier,
] as const;

const PERSON_MINIMAL_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.views.allPeople.viewFields.currentState
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.allPeople.viewFields.nextActionType
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.allPeople.viewFields.nextActionDate
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.currentState
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.nextActionType
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.nextActionDate
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.formStatus
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.crmStatus
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFields.isSuppressed
    .universalIdentifier,
] as const;

@RegisteredWorkspaceCommand('2.1.0', 1780000006000)
@Command({
  name: 'upgrade:2-1:backfill-person-outbound-fields',
  description:
    'Backfill person outbound fields and minimal allPeople/personRecordPageFields view fields on existing workspaces',
})
export class BackfillPersonOutboundFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    const existingPersonObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        universalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(existingPersonObjectMetadata)) {
      this.logger.log(
        `person object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const fieldMetadataToCreate = this.computeMissingFieldMetadata({
      existingFlatFieldMetadataMaps,
      standardAllFlatEntityMaps,
    });

    const viewsToCreate = this.computeMissingViews({
      existingFlatViewMaps,
      standardAllFlatEntityMaps,
    });

    const viewFieldsToCreate = this.computeMissingViewFields({
      existingFlatViewFieldMaps,
      standardAllFlatEntityMaps,
    });

    if (
      fieldMetadataToCreate.length === 0 &&
      viewsToCreate.length === 0 &&
      viewFieldsToCreate.length === 0
    ) {
      this.logger.log(
        `Nothing to backfill for person outbound fields in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling person outbound metadata in workspace ${workspaceId}: creating ${fieldMetadataToCreate.length} fields, ${viewsToCreate.length} views, ${viewFieldsToCreate.length} view fields`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          isSystemBuild: true,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill person outbound metadata for workspace ${workspaceId}:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill person outbound metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled person outbound metadata for workspace ${workspaceId}`,
    );
  }

  private computeMissingFieldMetadata({
    existingFlatFieldMetadataMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatFieldMetadataMaps: FlatFieldMetadataMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatFieldMetadata[] {
    return PERSON_OUTBOUND_FIELD_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const existingField =
          existingFlatFieldMetadataMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (isDefined(existingField)) {
          return [];
        }

        const standardField =
          standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (!isDefined(standardField)) {
          this.logger.warn(
            `Standard field metadata not found for universalIdentifier ${universalIdentifier}, skipping`,
          );

          return [];
        }

        return [standardField];
      },
    );
  }

  private computeMissingViews({
    existingFlatViewMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatViewMaps: FlatViewMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatView[] {
    return PERSON_MINIMAL_VIEW_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const existingView =
          existingFlatViewMaps.byUniversalIdentifier[universalIdentifier];

        if (isDefined(existingView)) {
          return [];
        }

        const standardView =
          standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (!isDefined(standardView)) {
          this.logger.warn(
            `Standard view not found for universalIdentifier ${universalIdentifier}, skipping`,
          );

          return [];
        }

        return [standardView];
      },
    );
  }

  private computeMissingViewFields({
    existingFlatViewFieldMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatViewFieldMaps: FlatViewFieldMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatViewField[] {
    return PERSON_MINIMAL_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const existingViewField =
          existingFlatViewFieldMaps.byUniversalIdentifier[universalIdentifier];

        if (isDefined(existingViewField)) {
          return [];
        }

        const standardViewField =
          standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (!isDefined(standardViewField)) {
          this.logger.warn(
            `Standard view field not found for universalIdentifier ${universalIdentifier}, skipping`,
          );

          return [];
        }

        return [standardViewField];
      },
    );
  }
}
