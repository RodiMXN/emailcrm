import { buildResolverNameMap } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

describe('buildResolverNameMap', () => {
  it('should include canonical and legacy person resolver names even when object labels are customized', () => {
    const resolverNameMap = buildResolverNameMap({
      byUniversalIdentifier: {
        person: {
          universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
          nameSingular: 'lead',
          namePlural: 'leads',
        },
      },
      byId: {},
      byNamePlural: {},
      byNameSingular: {},
      idByNamePlural: {},
      idByNameSingular: {},
    });

    expect(resolverNameMap.createPerson).toBeDefined();
    expect(resolverNameMap.createOnePerson).toBeDefined();
    expect(resolverNameMap.people).toBeDefined();
    expect(resolverNameMap.peopleGroupBy).toBeDefined();
    expect(resolverNameMap.aggregatePeople).toBeDefined();
  });
});
