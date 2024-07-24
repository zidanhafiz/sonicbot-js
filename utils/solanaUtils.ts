import {
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  Keypair,
  Signer,
} from '@solana/web3.js';
import base58 from 'bs58';
import colors from 'colors';

const DEVNET_URL = 'https://devnet.sonic.game/';
const connection = new Connection(DEVNET_URL, 'confirmed');

export async function sendSol(fromKeypair: Signer, toPublicKey: PublicKey, amount: number) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    fromKeypair,
  ]);
  console.log(colors.green('Transaction confirmed with signature:'), signature);
}

export function generateRandomAddresses(amount: number) {
  return Array.from({ length: amount }, () =>
    Keypair.generate().publicKey.toString()
  );
}

export function getKeypairFromPrivateKey(privateKey: string) {
  return Keypair.fromSecretKey(base58.decode(privateKey));
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export {
  DEVNET_URL,
  connection,
  PublicKey,
  LAMPORTS_PER_SOL,
};