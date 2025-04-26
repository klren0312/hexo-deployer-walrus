export interface HexoContext {
  readonly log: { info: (...args: Array<unknown>) => void }
  readonly public_dir: string
}

export interface HexoDeployment {
  readonly private_key: string
  readonly network: 'mainnet' | 'testnet'
  readonly epochs: number
}

interface HexoDeployer {
  (this: HexoContext, deploy: HexoDeployment): Promise<void>
}

interface HexoDeployerExtender {
  readonly register: (name: string, deployer: HexoDeployer) => Promise<void>
}

export interface HexoExtender {
  readonly deployer: HexoDeployerExtender
}

export interface TheFile {
  path: string
  mimetype: string
  blobId: string
  // eslint-disable-next-line node/prefer-global/buffer
  content: Buffer<ArrayBufferLike>
}
