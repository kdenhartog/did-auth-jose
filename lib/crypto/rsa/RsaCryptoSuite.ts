import RsaPublicKey from './RsaPublicKey';
import CryptoSuite from '../../interfaces/CryptoSuite';
import { DidPublicKey } from 'did-common-typescript';
// TODO: Create and reference TypeScript definition file for 'jwk-to-pem'
const jwkToPem = require('jwk-to-pem');
import * as crypto from 'crypto';
import * as constants from 'constants';
import PrivateKey from '../../security/PrivateKey';
import PublicKey from '../../security/PublicKey';

// TODO: Rewrite to allow additional cryptographic algorithms to be added easily then remove dependency on 'node-jose'.
const jose = require('node-jose');

/**
 * Encrypter plugin for RsaSignature2018
 */
export class RsaCryptoSuite implements CryptoSuite {
  getEncrypters () {
    return {
      'RSA-OAEP': {
        encrypt: RsaCryptoSuite.encryptRsaOaep,
        decrypt: RsaCryptoSuite.decryptRsaOaep
      }
    };
  }

  getSigners () {
    return {
      RS256: {
        sign: RsaCryptoSuite.signRs256,
        verify: RsaCryptoSuite.verifySignatureRs256
      },
      RS512: {
        sign: RsaCryptoSuite.signRs512,
        verify: RsaCryptoSuite.verifySignatureRs512
      }
    };
  }

  getKeyConstructors () {
    return {
      RsaVerificationKey2018: (keyData: DidPublicKey) => { return new RsaPublicKey(keyData); }
    };
  }

  /**
   * Verifies the given signed content using RS256 algorithm.
   *
   * @returns true if passed signature verification, false otherwise.
   */
  public static verifySignatureRs256 (signedContent: string, signature: string, jwk: PublicKey): boolean {
    const publicKey = jwkToPem(jwk);
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(signedContent);

    const passedVerification = verifier.verify(publicKey, signature, 'base64');
    return passedVerification;
  }

  /**
   * Sign the given content using the given private key in JWK format using algorithm RS256.
   * TODO: rewrite to get rid of node-jose dependency.
   *
   * @param jwsHeaderParameters Header parameters in addition to 'alg' and 'kid' to be included in the JWS.
   * @returns Signed payload in compact JWS format.
   */
  public static async signRs256 (content: string, jwk: PrivateKey): Promise<string> {
    let contentBuffer = Buffer.from(content);
    const contentJwsString = await jose.JWS.createSign({ format: 'compact', fields: {} }, jwk).update(contentBuffer).final();

    return contentJwsString;
  }

  /**
   * Verifies the given signed content using RS512 algorithm.
   *
   * @returns true if passed signature verification, false otherwise.
   */
  public static verifySignatureRs512 (signedContent: string, signature: string, jwk: PublicKey): boolean {
    const publicKey = jwkToPem(jwk);
    const verifier = crypto.createVerify('RSA-SHA512');
    verifier.write(signedContent);

    const passedVerification = verifier.verify(publicKey, signature, 'base64');
    return passedVerification;
  }

  /**
   * Sign the given content using the given private key in JWK format using algorithm RS512.
   * TODO: rewrite to get rid of node-jose dependency.
   *
   * @param jwsHeaderParameters Header parameters in addition to 'alg' and 'kid' to be included in the JWS.
   * @returns Signed payload in compact JWS format.
   */
  public static async signRs512 (content: string, jwk: PrivateKey): Promise<string> {
    let contentBuffer = Buffer.from(content);

    const contentJwsString = await jose.JWS.createSign({ format: 'compact', fields: {} }, jwk).update(contentBuffer).final();

    return contentJwsString;
  }

  /**
   * Rsa-OAEP encrypts the given data using the given public key in JWK format.
   */
  public static encryptRsaOaep (data: Buffer, jwk: PublicKey): Buffer {
    const publicKey = jwkToPem(jwk);
    const encryptedDataBuffer = crypto.publicEncrypt({ key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING }, data);

    return encryptedDataBuffer;
  }

  /**
   * Rsa-OAEP decrypts the given data using the given private key in JWK format.
   * TODO: correctly implement this after getting rid of node-jose dependency.
   */
  public static decryptRsaOaep (data: Buffer, jwk: PrivateKey): Buffer {
    const publicKey = jwkToPem(jwk);
    const decryptedDataBuffer = crypto.publicDecrypt({ key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING }, data);

    return decryptedDataBuffer;
  }
}
