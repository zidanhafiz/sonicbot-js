"use server";
import { HEADERS } from "@/utils/headers";
import {
  doTransactions,
  getKeypairFromPrivateKey,
  PublicKey,
  sendSol,
} from "@/utils/solanaUtils";
import { Keypair, Transaction } from "@solana/web3.js";
import axios, { AxiosHeaderValue } from "axios";
import moment from "moment";

export const doTransaction = async (data: {
  fromPrivateKey: string;
  toPublicKey: string;
  amount: string;
}) => {
  const fromKeypair = getKeypairFromPrivateKey(data.fromPrivateKey);
  const toPubKey = new PublicKey(data.toPublicKey);

  try {
    await sendSol(fromKeypair, toPubKey, parseFloat(data.amount));
    const message = `Transaction from ${fromKeypair.publicKey} to ${toPubKey} completed`;

    console.log(message);

    return {
      success: message,
    };
  } catch (error) {
    console.error(`Transaction failed: ${error}`);
    throw new Error(`transaction failed: ${error}`);
  }
};

export const dailyLogin = async (token: AxiosHeaderValue, keypair: Keypair) => {
  try {
    const { data } = await axios({
      url: "https://odyssey-api-beta.sonic.game/user/check-in/transaction",
      method: "GET",
      headers: { ...HEADERS, Authorization: token },
    });

    const txBuffer = Buffer.from(data.data.hash, "base64");
    const tx = Transaction.from(txBuffer);
    tx.partialSign(keypair);
    const signature = await doTransactions(tx, keypair);

    const response = await axios({
      url: "https://odyssey-api-beta.sonic.game/user/check-in",
      method: "POST",
      headers: { ...HEADERS, Authorization: token },
      data: {
        hash: signature,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response.data.message === "current account already checked in") {
      console.log(
        `[ ${moment().format("HH:mm:ss")} ] Error in daily login: ${
          error.response.data.message
        }`.red,
      );
      return "Already claimed";
    } else {
      console.log(
        `[ ${moment().format("HH:mm:ss")} ] Error claiming: ${
          error.response.data.message
        }`.red,
      );
      return "Error claiming";
    }
  }
};

export const openMysteryBox = async (
  token: AxiosHeaderValue,
  keypair: Keypair,
  retries: number = 3,
): Promise<any> => {
  try {
    const { data } = await axios({
      url: "https://odyssey-api-beta.sonic.game/user/rewards/mystery-box/build-tx",
      method: "GET",
      headers: { ...HEADERS, Authorization: token },
    });

    const txBuffer = Buffer.from(data.data.hash, "base64");
    const tx = Transaction.from(txBuffer);
    tx.partialSign(keypair);

    const signature = await doTransactions(tx, keypair);

    const response = await axios({
      url: "https://odyssey-api-beta.sonic.game/user/rewards/mystery-box/open",
      method: "POST",
      headers: { ...HEADERS, Authorization: token },
      data: {
        hash: signature,
      },
    });

    console.log(response.data);

    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retrying opening mystery box... (${retries} retries left)`.yellow,
      );
      await new Promise((res) => setTimeout(res, 1000));
      return openMysteryBox(token, keypair, retries - 1);
    } else {
      console.log(`Error opening mystery box: ${error}`.red);
      throw error;
    }
  }
}
