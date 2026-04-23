import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

export const isCanonicalPersonObject = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    | 'universalIdentifier'
    | 'nameSingular'
    | 'namePlural'
    | 'labelSingular'
    | 'labelPlural'
    | 'isCustom'
    | 'isSystem'
  >,
) =>
  flatObjectMetadata.universalIdentifier ===
    STANDARD_OBJECTS.person.universalIdentifier ||
  ((!flatObjectMetadata.isCustom || flatObjectMetadata.isSystem) &&
    (flatObjectMetadata.nameSingular === 'person' ||
      flatObjectMetadata.namePlural === 'people' ||
      flatObjectMetadata.labelSingular.toLowerCase() === 'person' ||
      flatObjectMetadata.labelPlural.toLowerCase() === 'people' ||
      flatObjectMetadata.labelSingular.toLowerCase() === 'lead' ||
      flatObjectMetadata.labelPlural.toLowerCase() === 'leads'));

export const getCanonicalPersonResolverName = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
  method: WorkspaceResolverBuilderMethodNames,
) => {
  if (!isCanonicalPersonObject(flatObjectMetadata)) {
    return null;
  }

  switch (method) {
    case 'findMany':
      return 'people';
    case 'findOne':
      return 'person';
    case 'findDuplicates':
      return 'personDuplicates';
    case 'createOne':
      return 'createPerson';
    case 'createMany':
      return 'createPeople';
    case 'updateOne':
      return 'updatePerson';
    case 'updateMany':
      return 'updatePeople';
    case 'deleteOne':
      return 'deletePerson';
    case 'deleteMany':
      return 'deletePeople';
    case 'destroyOne':
      return 'destroyPerson';
    case 'destroyMany':
      return 'destroyPeople';
    case 'restoreOne':
      return 'restorePerson';
    case 'restoreMany':
      return 'restorePeople';
    case 'mergeMany':
      return 'mergePeople';
    case 'groupBy':
      return 'peopleGroupBy';
    default:
      return null;
  }
};

export const getCanonicalPersonInputTypeName = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
  kind: GqlInputTypeDefinitionKind,
) => {
  if (!isCanonicalPersonObject(flatObjectMetadata)) {
    return null;
  }

  return `Person${pascalCase(kind.toString())}Input`;
};
