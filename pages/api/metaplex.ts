import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { Metadata, Metaplex } from '@metaplex-foundation/js';

type ResponseData = {
  success: boolean,
  message?: string,
  data?: object,
}

const connection = new Connection(clusterApiUrl("devnet"));
const mx = Metaplex.make(connection);


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method != 'GET') return res.status(405).end()

  try {
    const owner = new PublicKey(req.query.owner as string)
    const metadatas = await mx.nfts().findAllByOwner({ owner }).run()
    const nfts = await Promise.all((metadatas as Metadata[]).map(async md => {
      const res = await axios.get(md.uri)
      return {
        mint: md.mintAddress.toString(),
        image: res.data.image,
      }
    }))
    res.status(200).json({
      success: true,
      data: nfts,
    })

  } catch (e) {
    console.log("Error", e)
    res.status(200).json({
      success: false,
      message: `Unprocessable request: ${(e as Error).message}`,
    })
  }

}
