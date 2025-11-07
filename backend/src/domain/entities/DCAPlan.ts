export interface DCAPlan {
  _id?: string;

  userAddress: string;                // Wallet del usuario
  network: string;                    // Red (sepolia, polygon, etc.)
  tokenFrom: string;                  // Token origen (ej: USDC)
  tokenTo: string;                    // Token destino (ej: WETH)
  
  totalAmount: number;                // Monto total a invertir
  amountPerInterval: number;          // Monto por ejecución
  intervalSeconds: number;            // Intervalo entre ejecuciones (en segundos)
  totalOperations: number;            // Número total de compras
  executedOperations: number;         // Compras ejecutadas hasta ahora

  lastExecution?: Date;               // Última ejecución
  nextExecution?: Date;               // Próxima ejecución programada

  status: "active" | "paused" | "completed" | "failed";
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
