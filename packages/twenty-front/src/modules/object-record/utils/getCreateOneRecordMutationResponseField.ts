import { capitalize } from 'twenty-shared/utils';
export const getCreateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `createOne${capitalize(objectNameSingular)}`;
