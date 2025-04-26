import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'
import path from 'path'
import fs from 'fs'
import type { HexoContext, HexoDeployment, TheFile } from './type'
import mime from 'mime'
import type { ClientWithExtensions } from '@mysten/sui/experimental'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'


export default async function (this: HexoContext, deploy: HexoDeployment): Promise<void> {
  if (!deploy.private_key) {
    throw new Error('private_key is required')
  }
  if (!['testnet', 'mainnet'].includes(deploy.network)) {
    throw new Error('network must be testnet or mainnet')
  }
  if (deploy.epochs > 53) {
    throw new Error('epochs must be less than 53.which is 53,corresponding to two years')
  }
  const { public_dir: publicDir, log } = this
  const keypair = Ed25519Keypair.fromSecretKey(deploy.private_key)
  log.info('Sui Wallet Address: ', keypair.toSuiAddress())
  const suiClient = new SuiClient({
    url: getFullnodeUrl(deploy.network),
    network: deploy.network
  }).$extend(
    WalrusClient.experimental_asClientExtension({
      storageNodeClientOptions: {
        timeout: 120_000,
      },
    }),
  )

  const files = listDir(publicDir, [])
  if (files.length === 0) {
    throw new Error('No files to upload')
  }

  for (let i = 0, len = files.length; i < len - 1; i++) {
    const file = files[i]
    log.info('Uploading file:' + file.path)
    const blobId = await uploadFile(suiClient, keypair, deploy.epochs, file.content)
    file.blobId = blobId
    log.info(file.path + ' upload success, blobId: ' + blobId)
  }
}

/**
 * get file list
 * @param dir 
 * @param filelist 
 * @returns 
 */
function listDir(
  dir: string,
  filelist: TheFile[]
) {
  const files: string[] = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach((file: string) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = listDir(path.join(dir, file), filelist)
    } else {
      const content = fs.readFileSync(path.join(dir, file))
      const data = {
        path: path.join(dir, file).split('public')[1],
        mimetype: mime.getType(file) || '',
        content,
        blobId: ''
      }
      filelist.push(data)
    }
  })
  return filelist
}

/**
 * upload file to walrus
 * @param client 
 * @param keypair 
 * @param epochs 
 * @param fileContent 
 * @returns 
 */
async function uploadFile(
  client: ClientWithExtensions<{
    walrus: WalrusClient;
  }, SuiClient>,
  keypair: Ed25519Keypair,
  epochs: number,
  fileContent: Buffer<ArrayBufferLike>
) {
  const { blobId } = await client.walrus.writeBlob({
    blob: fileContent,
    deletable: true,
    epochs,
    signer: keypair,
  })

  return blobId
}
