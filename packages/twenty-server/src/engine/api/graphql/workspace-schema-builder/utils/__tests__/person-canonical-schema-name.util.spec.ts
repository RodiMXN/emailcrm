import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import {
  getCanonicalPersonInputTypeName,
  getCanonicalPersonResolverName,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/person-canonical-schema-name.util';

describe('person canonical schema name utils', () => {
  const personObject = {
    universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    isCustom: false,
    isSystem: true,
  };

  const leadRelabeledSystemObject = {
    universalIdentifier: '00000000-0000-0000-0000-000000000000',
    nameSingular: 'lead',
    namePlural: 'leads',
    labelSingular: 'Lead',
    labelPlural: 'Leads',
    isCustom: false,
    isSystem: true,
  };

  it('should return canonical resolver names for person object', () => {
    expect(getCanonicalPersonResolverName(personObject, 'findMany')).toBe(
      'people',
    );
    expect(getCanonicalPersonResolverName(personObject, 'createOne')).toBe(
      'createPerson',
    );
  });

  it('should return canonical input type names for person object', () => {
    expect(
      getCanonicalPersonInputTypeName(
        personObject,
        GqlInputTypeDefinitionKind.Create,
      ),
    ).toBe('PersonCreateInput');
    expect(
      getCanonicalPersonInputTypeName(
        personObject,
        GqlInputTypeDefinitionKind.Filter,
      ),
    ).toBe('PersonFilterInput');
  });

  it('should also treat relabeled system lead object as canonical person object', () => {
    expect(
      getCanonicalPersonResolverName(leadRelabeledSystemObject, 'findMany'),
    ).toBe('people');
    expect(
      getCanonicalPersonInputTypeName(
        leadRelabeledSystemObject,
        GqlInputTypeDefinitionKind.Create,
      ),
    ).toBe('PersonCreateInput');
  });
});
