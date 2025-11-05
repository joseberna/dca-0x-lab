import { WalletModel } from "../models/WalletModel.ts";
import logger from "../../config/logger.ts";

/**
 * 💼 WalletRepository
 * Gestiona la persistencia de wallets de usuarios para los planes DCA.
 */
export class WalletRepository {
  /**
   * 🔍 Busca una wallet por dirección.
   */
  async findByAddress(address: string) {
    try {
      return await WalletModel.findOne({ address }).lean();
    } catch (err: any) {
      logger.error(`❌ Error buscando wallet ${address}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🆕 Crea una nueva wallet si no existe.
   * Devuelve la wallet existente o la nueva creada.
   */
  async findOrCreate(address: string) {
    try {
      let wallet = await WalletModel.findOne({ address }).lean();

      if (!wallet) {
        const newWallet = await WalletModel.create({ address });
        wallet = newWallet.toObject();
        logger.info(`🆕 Wallet registrada: ${address}`);
      }

      return wallet;
    } catch (err: any) {
      logger.error(`❌ Error creando o buscando wallet ${address}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 📋 Lista todas las wallets registradas.
   */
  async findAll() {
    try {
      return await WalletModel.find().lean();
    } catch (err: any) {
      logger.error(`❌ Error listando wallets: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🗑️ Elimina una wallet (por mantenimiento o limpieza de datos).
   */
  async delete(address: string) {
    try {
      await WalletModel.deleteOne({ address });
      logger.info(`🗑️ Wallet eliminada: ${address}`);
      return true;
    } catch (err: any) {
      logger.error(`❌ Error eliminando wallet ${address}: ${err.message}`);
      throw err;
    }
  }
}
