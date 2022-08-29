import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as anchor from "@project-serum/anchor";
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { getCandyMachineState, mintOneToken } from "../../utils/candy-machine";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

type ResponseData = {
  success: boolean,
  message?: string,
  data?: object,
}

const connection = new Connection(clusterApiUrl("devnet"));
const candyMachineId = new PublicKey('2JuHo7foN4ybZRUssESKmTBhVPhCa95v6odG7T1UDMWU')


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method != 'GET') return res.status(405).end()

  try {
    const lePK = new PublicKey(req.query.owner as string)

    const anchorWallet = {
      publicKey: lePK,
    } as anchor.Wallet

    const candyMachine = await getCandyMachineState(
      anchorWallet,
      candyMachineId,
      connection
    );

    const [instructions, signers] = await mintOneToken(candyMachine, lePK);

    const transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));

    const block = await connection.getLatestBlockhash();
    transaction.recentBlockhash = block.blockhash;
    transaction.feePayer = lePK

    transaction.partialSign(...signers)

    res.status(200).json({
      success: true,
      data: {
        transaction: bs58.encode(transaction.serialize({
          verifySignatures: false
        }))
      },
    })

  } catch (e) {
    console.log("Error", e)
    res.status(200).json({
      success: false,
      message: `Unprocessable request: ${(e as Error).message}`,
    })
  }

}
