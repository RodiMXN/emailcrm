import { buildResolverNameMap } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';

describe('buildResolverNameMap', () => {
  it('should include legacy resolver names for createOne and groupBy', () => {
    const resolverNameMap = buildResolverNameMap({
      byUniversalIdentifier: {
        person: {
          universalIdentifier: 'person',
          nameSingular: 'person',
          namePlural: 'people',
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
    expect(resolverNameMap.peopleGroupBy).toBeDefined();
    expect(resolverNameMap.aggregatePeople).toBeDefined();
  });
});
