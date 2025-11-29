import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock wagmi hooks for testing
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  useChainId: () => 11155111, // Sepolia
  usePublicClient: () => ({}),
  useWriteContract: () => ({
    writeContractAsync: vi.fn(),
  }),
  WagmiProvider: ({ children }: any) => children,
}))

// Mock RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
  RainbowKitProvider: ({ children }: any) => children,
  darkTheme: () => ({}),
  getDefaultConfig: () => ({}),
}))
