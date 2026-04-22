import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';

type WorkspaceFlatEntityMaps = Awaited<
  ReturnType<WorkspaceCacheService['getOrRecompute']>
>;
type FlatViewMaps = WorkspaceFlatEntityMaps['flatViewMaps'];
type FlatViewFieldMaps = WorkspaceFlatEntityMaps['flatViewFieldMaps'];
type FlatViewFilterMaps = WorkspaceFlatEntityMaps['flatViewFilterMaps'];

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const SUPPRESSED_LEADS_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.suppressedLeads.universalIdentifier;

const SUPPRESSED_LEADS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.name
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.emails
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.company
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.currentState
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.isSuppressed
    .universalIdentifier,
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFields.suppressionReason
    .universalIdentifier,
] as const;

const SUPPRESSED_LEADS_VIEW_FILTER_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.views.suppressedLeads.viewFilters.isSuppressedIsTrue
    .universalIdentifier,
] as const;

@RegisteredWorkspaceCommand('2.1.0', 1780000009000)
@Command({
  name: 'upgrade:2-1:backfill-person-suppressed-leads-view',
  description:
    'Backfill person suppressedLeads standard view, its approved view fields, and its approved filters',
})
export class BackfillPersonSuppressedLeadsViewCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewFilterMaps: existingFlatViewFilterMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
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

    const viewToCreate = this.computeMissingSuppressedLeadsView({
      existingFlatViewMaps,
      standardAllFlatEntityMaps,
    });

    const viewFieldsToCreate =
      this.computeMissingSuppressedLeadsViewFields({
        existingFlatViewFieldMaps,
        standardAllFlatEntityMaps,
      });

    const viewFiltersToCreate =
      this.computeMissingSuppressedLeadsViewFilters({
        existingFlatViewFilterMaps,
        standardAllFlatEntityMaps,
      });

    if (
      !isDefined(viewToCreate) &&
      viewFieldsToCreate.length === 0 &&
      viewFiltersToCreate.length === 0
    ) {
      this.logger.log(
        `Nothing to backfill for person suppressedLeads view in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling person suppressedLeads view metadata in workspace ${workspaceId}: creating ${isDefined(viewToCreate) ? 1 : 0} views, ${viewFieldsToCreate.length} view fields, ${viewFiltersToCreate.length} view filters`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: isDefined(viewToCreate) ? [viewToCreate] : [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: viewFiltersToCreate,
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
        `Failed to backfill person suppressedLeads metadata for workspace ${workspaceId}:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill person suppressedLeads metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled person suppressedLeads metadata for workspace ${workspaceId}`,
    );
  }

  private computeMissingSuppressedLeadsView({
    existingFlatViewMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatViewMaps: FlatViewMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatView | undefined {
    const existingView =
      existingFlatViewMaps.byUniversalIdentifier[
        SUPPRESSED_LEADS_VIEW_UNIVERSAL_IDENTIFIER
      ];

    if (isDefined(existingView)) {
      return undefined;
    }

    const standardView =
      standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        SUPPRESSED_LEADS_VIEW_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(standardView)) {
      this.logger.warn(
        `Standard view not found for universalIdentifier ${SUPPRESSED_LEADS_VIEW_UNIVERSAL_IDENTIFIER}, skipping`,
      );

      return undefined;
    }

    return standardView;
  }

  private computeMissingSuppressedLeadsViewFields({
    existingFlatViewFieldMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatViewFieldMaps: FlatViewFieldMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatViewField[] {
    return SUPPRESSED_LEADS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.flatMap(
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

  private computeMissingSuppressedLeadsViewFilters({
    existingFlatViewFilterMaps,
    standardAllFlatEntityMaps,
  }: {
    existingFlatViewFilterMaps: FlatViewFilterMaps;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): UniversalFlatViewFilter[] {
    return SUPPRESSED_LEADS_VIEW_FILTER_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const existingViewFilter =
          existingFlatViewFilterMaps.byUniversalIdentifier[universalIdentifier];

        if (isDefined(existingViewFilter)) {
          return [];
        }

        const standardViewFilter =
          standardAllFlatEntityMaps.flatViewFilterMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (!isDefined(standardViewFilter)) {
          this.logger.warn(
            `Standard view filter not found for universalIdentifier ${universalIdentifier}, skipping`,
          );

          return [];
        }

        return [standardViewFilter];
      },
    );
  }
}
