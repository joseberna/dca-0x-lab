import { TOKENS_BY_NETWORK } from "../config/tokensByNetwork";

export const getAvailableTokens = (chainId?: number) => {
  if (!chainId) return [];
  return TOKENS_BY_NETWORK[chainId] || [];
};
