// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import bs58 from 'bs58'
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean,
  message?: string,
  data?: object,
}

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
)

// const connection = new Connection('https://api.devnet.solana.com/');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  // if (req.method == "GET") {

  //   const tx = new Transaction().add(
  //     new TransactionInstruction({
  //       programId: MEMO_PROGRAM_ID,
  //       keys: [],
  //       data: Buffer.from(req.query.mint as string, "utf8"),
  //     })
  //   )
  //   tx.feePayer = new PublicKey(req.query.wallet as string)
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  //   const encodedTx = bs58.encode(tx.serialize({
  //     verifySignatures: false,
  //   }))

  //   res.status(200).json({ encodedTx })
  // }

  if (req.method == "POST") {
    const { encodedTx, mint } = req.body.params
    console.log("Mint", mint)
    const signedTx = Transaction.from(bs58.decode(encodedTx))
    
    let signerPK
    try {
      signerPK = signedTx.signatures[0].publicKey
      console.log("Signer", signerPK.toString())
      const inx = signedTx.instructions[0]
      if (!inx.programId.equals(MEMO_PROGRAM_ID)) throw new Error('!inx.programId.equals(MEMO_PROGRAM_ID)')
      if (inx.data.toString() != mint) throw new Error('inx.data.toString() != mint')
      if (!signedTx.verifySignatures()) throw new Error('!signedTx.verifySignatures()')
      // TODO: check mint belongs to collection
      // TODO: check if signer owns mint
      // TODO: if mint is recordered, throw if signer changed
    } catch (e) {
      return res.status(200).json({
        success: false,
        message: (e as Error).message,
      })
    }

    // TODO: record mint and signer
    res.status(200).json({
      success: true,
      message: `Wallet ${signerPK.toString()} owns NFT ${mint}`,
    })
  }
}
