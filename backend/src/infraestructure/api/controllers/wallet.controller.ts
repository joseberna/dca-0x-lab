import type { Request, Response } from "express";
import { WalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { io } from "../../sockets/socketServer.ts";
import logger from "../../../config/logger.ts";

/**
 * 💼 WalletController
 * Maneja endpoints relacionados con las wallets registradas.
 */
export class WalletController {
  private walletRepo = new WalletRepository();

  /**
   * 📋 GET /api/wallets
   * Lista todas las wallets registradas.
   */
  async getAll(req: Request, res: Response) {
    try {
      const wallets = await this.walletRepo.findAll();
      return res.status(200).json({ success: true, data: wallets });
    } catch (err: any) {
      logger.error(`❌ Error listando wallets: ${err.message}`);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * 🧩 POST /api/wallets
   * Crea o recupera una wallet existente.
   */
  async create(req: Request, res: Response) {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ success: false, message: "Missing wallet address" });
      }

      const wallet = await this.walletRepo.findOrCreate(address);

      // 🔔 Emitir evento en tiempo real
      io.emit("wallet:created", wallet);

      return res.status(201).json({ success: true, data: wallet });
    } catch (err: any) {
      logger.error(`❌ Error creando wallet: ${err.message}`);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * ❌ DELETE /api/wallets/:address
   * Elimina una wallet.
   */
  async delete(req: Request, res: Response) {
    try {
      const { address } = req.params;
      if (!address) {
        return res.status(400).json({ success: false, message: "Missing wallet address" });
      }

      await this.walletRepo.delete(address);
      io.emit("wallet:deleted", { address });

      return res.status(200).json({ success: true, message: "Wallet deleted" });
    } catch (err: any) {
      logger.error(`❌ Error eliminando wallet: ${err.message}`);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
