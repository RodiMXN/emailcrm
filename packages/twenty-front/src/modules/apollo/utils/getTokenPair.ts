import { isDefined } from 'twenty-shared/utils';
import { type AuthTokenPair } from '~/generated-metadata/graphql';
import { cookieStorage } from '~/utils/cookie-storage';
import { isValidAuthTokenPair } from './isValidAuthTokenPair';

let inMemoryTokenPair: AuthTokenPair | undefined;
const TOKEN_PAIR_LOCAL_STORAGE_KEY = 'tokenPair';

const readTokenPairFromLocalStorage = (): string | undefined => {
  try {
    return localStorage.getItem(TOKEN_PAIR_LOCAL_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const setInMemoryTokenPair = (
  tokenPair: AuthTokenPair | null | undefined,
) => {
  if (!isDefined(tokenPair)) {
    inMemoryTokenPair = undefined;

    return;
  }

  if (!isValidAuthTokenPair(tokenPair)) {
    inMemoryTokenPair = undefined;

    return;
  }

  inMemoryTokenPair = tokenPair;
};

export const getTokenPair = (): AuthTokenPair | undefined => {
  if (isDefined(inMemoryTokenPair) && isValidAuthTokenPair(inMemoryTokenPair)) {
    return inMemoryTokenPair;
  }

  const stringTokenPair =
    cookieStorage.getItem('tokenPair') ?? readTokenPairFromLocalStorage();

  if (!isDefined(stringTokenPair)) {
    // oxlint-disable-next-line no-console
    console.log('tokenPair is undefined');

    return undefined;
  }

  try {
    const parsedTokenPair = JSON.parse(stringTokenPair);

    if (!isValidAuthTokenPair(parsedTokenPair)) {
      inMemoryTokenPair = undefined;
      cookieStorage.removeItem('tokenPair');
      return undefined;
    }

    inMemoryTokenPair = parsedTokenPair;

    return parsedTokenPair;
  } catch {
    inMemoryTokenPair = undefined;
    cookieStorage.removeItem('tokenPair');
    return undefined;
  }
};
