// import { randomBytes } from 'crypto';
// import { createHash } from 'crypto';
// import { secp256k1 } from 'ethereum-cryptography/secp256k1';
// import { keccak256 } from 'ethereum-cryptography/keccak';
// import { utf8ToBytes, toHex } from 'backend';
//
// // Типы для наших MPC структур
// type KeyShare = {
//   privateShare: Uint8Array;
//   publicShare: Uint8Array;
// };
//
// type SignatureShare = {
//   r: bigint;
//   s: bigint;
//   v?: number;
// };
//
// type Party = {
//   id: number;
//   keyShare: KeyShare;
// };
//
// class MPCSigner {
//   private parties: Party[];
//   private publicKey: Uint8Array;
//
//   constructor(parties: Party[], publicKey: Uint8Array) {
//     this.parties = parties;
//     this.publicKey = publicKey;
//   }
//
//   static initialize(n: number): { parties: Party[]; publicKey: Uint8Array } {
//     const secret = randomBytes(32);
//     const publicKey = secp256k1.getPublicKey(secret);
//
//     const parties: Party[] = [];
//     for (let i = 0; i < n; i++) {
//       const privateShare = randomBytes(32);
//       const publicShare = secp256k1.getPublicKey(privateShare);
//       parties.push({
//         id: i + 1,
//         keyShare: { privateShare, publicShare }
//       });
//     }
//
//     return { parties, publicKey };
//   }
//
//   async generateSignature(txData: string, signers: Party[]): Promise<string> {
//     const txHash = this.hashMessage(txData);
//     const signatureShares: SignatureShare[] = [];
//
//     for (const signer of signers) {
//       const share = await this.generateSignatureShare(txHash, signer);
//       signatureShares.push(share);
//     }
//
//     const signature = this.aggregateSignatureShares(signatureShares);
//     return this.serializeSignature(signature);
//   }
//
//   private async generateSignatureShare(
//     messageHash: Uint8Array,
//     party: Party
//   ): Promise<SignatureShare> {
//
//     const { privateShare } = party.keyShare;
//     const signature = await secp256k1.sign(messageHash, privateShare);
//
//     return {
//       r: signature.r,
//       s: signature.s,
//       v: signature.recovery
//     };
//   }
//
//   private aggregateSignatureShares(shares: SignatureShare[]): SignatureShare {
//
//     let r = 0n;
//     let s = 0n;
//     let v = 0;
//
//     for (const share of shares) {
//       r += share.r;
//       s += share.s;
//       if (share.v) v += share.v;
//     }
//
//     r = r / BigInt(shares.length);
//     s = s / BigInt(shares.length);
//     v = Math.round(v / shares.length);
//
//     return { r, s, v };
//   }
//
//   private serializeSignature(signature: SignatureShare): string {
//     const r = signature.r.toString(16).padStart(64, '0');
//     const s = signature.s.toString(16).padStart(64, '0');
//     const v = signature.v?.toString(16) ?? '1b';
//     return `0x${r}${s}${v}`;
//   }
//
//   private hashMessage(message: string): Uint8Array {
//     const bytes = utf8ToBytes(message);
//     return keccak256(bytes);
//   }
//
//   public getAddress(): string {
//     const publicKey = this.publicKey.slice(1);
//     const hash = keccak256(publicKey);
//     return `0x${toHex(hash.slice(-20))}`;
//   }
// }
//
// async function demo() {
//   const { parties, publicKey } = MPCSigner.initialize(2);
//
//   const signer = new MPCSigner(parties, publicKey);
//
//   console.log('MPC Address:', signer.getAddress());
//
//   // Подписываем транзакцию
//   const txData = JSON.stringify({
//     from: signer.getAddress(),
//     to: '0xRecipientAddress',
//     value: '1.0',
//     nonce: 1
//   });
//
//   const signature = await signer.generateSignature(txData, parties.slice(0, 2));
//   console.log('Signature:', signature);
//
//   // Верификация подписи (используя публичный ключ)
//   const txHash = signer['hashMessage'](txData);
//   const isValid = secp256k1.verify(signature, txHash, publicKey);
//   console.log('Signature valid:', isValid);
// }
//
// demo().catch(console.error);
