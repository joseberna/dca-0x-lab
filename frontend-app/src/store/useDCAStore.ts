import { create } from "zustand";
import { useAccount } from "wagmi";

interface DCAState {
  address?: string;
  isConnected: boolean;
  setConnection: (address?: string, isConnected?: boolean) => void;
}

/**
 * 🔗 Store global para sincronizar el estado de conexión de la wallet.
 */
export const useDCAStore = create<DCAState>((set) => ({
  address: undefined,
  isConnected: false,
  setConnection: (address, isConnected) => set({ address, isConnected }),
}));

/**
 * 🧩 Hook sincronizador: escucha el estado de Wagmi y actualiza el store
 */
export function useSyncWallet() {
  const { address, isConnected } = useAccount();
  const setConnection = useDCAStore((state) => state.setConnection);

  // sincroniza automáticamente cuando cambia wagmi
  if (typeof window !== "undefined") {
    setConnection(address, isConnected);
  }

  return { address, isConnected };
}
