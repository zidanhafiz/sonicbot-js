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
import axios from 'axios';
import base58 from 'bs58';
import colors from 'colors';
import { HEADERS } from './headers';
import nacl from 'tweetnacl';

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

export const getKeypair = (privateKey: string) => {
  const decodedPrivateKey = base58.decode(privateKey);
  const keypair = Keypair.fromSecretKey(decodedPrivateKey);
  return keypair;
}

export const getToken = async (privateKey: string) => {
  try {
    const { data } = await axios({
      url: 'https://odyssey-api-beta.sonic.game/auth/sonic/challenge',
      params: {
        wallet: getKeypair(privateKey).publicKey,
      },
      headers: HEADERS,
    });

    const sign = nacl.sign.detached(
      Buffer.from(data.data) as unknown as Uint8Array,
      getKeypair(privateKey).secretKey
    );
    const signature = Buffer.from(sign).toString('base64');
    const publicKey = getKeypair(privateKey).publicKey;
    const encodedPublicKey = Buffer.from(publicKey.toBytes()).toString(
      'base64'
    );
    const response = await axios({
      url: 'https://odyssey-api-beta.sonic.game/auth/sonic/authorize',
      method: 'POST',
      headers: HEADERS,
      data: {
        address: publicKey,
        address_encoded: encodedPublicKey,
        signature,
      },
    });

    return response.data.data.token;
  } catch (error) {
    console.log(`Error fetching token: ${error}`.red);
  }
}

export const doTransactions = async (tx: Transaction, keypair: Keypair, retries: number = 3): Promise<string> => {
  try {
    const bufferTransaction = tx.serialize();
    const signature = await connection.sendRawTransaction(bufferTransaction);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying transaction... (${retries} retries left)`.yellow);
      await new Promise((res) => setTimeout(res, 1000));
      return doTransactions(tx, keypair, retries - 1);
    } else {
      console.log(`Error in transaction: ${error}`.red);
      throw error;
    }
  }
}

export {
  DEVNET_URL,
  connection,
  PublicKey,
  LAMPORTS_PER_SOL,
};