"use server"
import { getKeypairFromPrivateKey, PublicKey, sendSol, delay } from "@/utils/solanaUtils";

export const doTransaction = async (
  data: { 
    fromPrivateKey: string, 
    toPublicKey: string, 
    amount: string, 
  }
) => {
  const fromKeypair = getKeypairFromPrivateKey(data.fromPrivateKey);
  const toPubKey = new PublicKey(data.toPublicKey);

  try {
    await sendSol(fromKeypair, toPubKey, parseFloat(data.amount));
    const message = `Transaction from ${fromKeypair.publicKey} to ${toPubKey} completed`;

    console.log(message);

    return {
      success: message 
    }
  } catch (error) {
    console.error(`Transaction failed: ${error}`);
    throw new Error(`transaction failed: ${error}`);
  }
}

export const stopTransaction = async (): Promise<{error?: string, success?: string}> => {
  return {
    success: 'All transactions stopped'
  }
}
