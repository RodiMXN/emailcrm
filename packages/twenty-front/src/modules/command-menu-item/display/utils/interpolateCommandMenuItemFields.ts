import { isOutboundCrmV1UiMode } from '@/app/constants/isOutboundCrmV1UiMode';
import { type CommandMenuContextApi, type Nullable } from 'twenty-shared/types';
import { interpolateCommandMenuItemTemplate } from 'twenty-shared/utils';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

type InterpolatedCommandMenuItemFields = {
  iconKey: Nullable<string>;
  label: string;
  shortLabel: Nullable<string>;
};

const shouldUseLeadCreateLabels = (
  item: CommandMenuItemFieldsFragment,
  commandMenuContextApi: CommandMenuContextApi,
): boolean => {
  if (!isOutboundCrmV1UiMode) {
    return false;
  }

  if (item.engineComponentKey !== EngineComponentKey.CREATE_NEW_RECORD) {
    return false;
  }

  return commandMenuContextApi.objectMetadataItem?.nameSingular === 'person';
};

export const interpolateCommandMenuItemFields = (
  item: CommandMenuItemFieldsFragment,
  commandMenuContextApi: CommandMenuContextApi,
): InterpolatedCommandMenuItemFields => {
  const iconKey = interpolateCommandMenuItemTemplate({
    label: item.icon,
    context: commandMenuContextApi,
  });

  const label =
    interpolateCommandMenuItemTemplate({
      label: item.label,
      context: commandMenuContextApi,
    }) ?? item.label;

  const shortLabel = interpolateCommandMenuItemTemplate({
    label: item.shortLabel,
    context: commandMenuContextApi,
  });

  if (shouldUseLeadCreateLabels(item, commandMenuContextApi)) {
    return {
      iconKey,
      label: 'Create new lead',
      shortLabel: 'Add lead',
    };
  }

  return { iconKey, label, shortLabel };
};
