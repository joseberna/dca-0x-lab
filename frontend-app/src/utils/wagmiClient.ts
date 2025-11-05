
import { createConfig, http, createStorage, cookieStorage } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [polygon],
  connectors: [
    injected({
      shimDisconnect: true,   
    }),
  ],
  storage: createStorage({
    storage:
      typeof window !== 'undefined'
        ? window.localStorage
        : cookieStorage,
  }),
  transports: {
    [polygon.id]: http(process.env.REACT_APP_RPC_POLYGON),
  },
})
