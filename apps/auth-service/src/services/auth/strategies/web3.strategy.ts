import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_ERROR_CODES,
  AuthenticationError,
  IAuthResult,
  IAuthStrategy,
  IWeb3AuthCredentials,
  LoginMethod,
  ServiceJwtGenerator,
  UserClient,
} from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';
import { ethers } from 'ethers';

@Injectable()
export class Web3Strategy implements IAuthStrategy {
  constructor(
    private readonly userClient: UserClient,
    private readonly serviceJwtGenerator: ServiceJwtGenerator,
    private readonly configService: ConfigService,
    @Inject('CACHE_MANAGER')
    private readonly cacheManager: Cache,
  ) { }

  async authenticate(
    credentials: IWeb3AuthCredentials,
    traceId?: string,
  ): Promise<IAuthResult> {
    try {
      const { walletAddress, signature } = credentials;

      // проверяем валидность адреса
      if (!ethers.isAddress(walletAddress)) {
        throw new AuthenticationError(
          'Invalid wallet address format',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // получаем nonce из кэша
      const nonceKey = `web3:nonce:${walletAddress.toLowerCase()}`;
      const message = await this.cacheManager.get<{ message: any }>(nonceKey);

      if (!message) {
        throw new AuthenticationError(
          'Nonce not found or expired',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // проверяем подпись
      const isValidSignature = await this.verifyEIP712Signature(
        walletAddress,
        message,
        signature,
      );

      // если подпись не валидна, то выбрасываем ошибку
      if (!isValidSignature) {
        throw new AuthenticationError(
          'Invalid signature',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // удаляем использованный nonce
      await this.cacheManager.del(nonceKey);

      // генерируем токен для связи с сервисом пользователя (Может быть есть способ лучше?)
      const serviceToken = await this.serviceJwtGenerator.generateServiceJwt({
        subject: walletAddress,
        actor: 'auth-service',
        issuer: 'auth-service',
        audience: 'user',
        type: 'service',
        expiresIn: '5m',
      });

      // ищем или создаем пользователя
      const userResult = await this.userClient.ensureUserExists(
        {
          login: walletAddress.toLowerCase(),
          loginType: LoginMethod.WEB3,
          password: 'web3',
        },
        traceId,
        serviceToken,
      );

      if (!userResult.status) {
        throw new AuthenticationError(
          'User creation/retrieval failed',
          AUTH_ERROR_CODES.AUTHENTICATION_FAILED,
        );
      }

      return {
        status: true,
        user: {
          id: userResult.user.id,
          fullName: walletAddress, // имя юзера?
        },
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.AUTHENTICATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        error: errorMessage,
        user: null,
        errorCode,
      };
    }
  }

  async validateToken(_token: string): Promise<any> {
    return Promise.resolve({
      status: false,
      message: 'Not implemented for Web3 strategy',
      error: 'Not implemented',
      errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
    });
  }

  async generateNonce(walletAddress: string): Promise<{
    status: boolean;
    message: string;
    nonce?: string;
    data?: { message: any };
    error?: string;
    errorCode?: AUTH_ERROR_CODES;
  }> {
    try {
      if (!ethers.isAddress(walletAddress)) {
        throw new AuthenticationError(
          'Invalid wallet address format',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      const web3Config = this.configService.get().web3;

      const nonce = Math.floor(Math.random() * 1000000000000);
      const timestamp = Math.floor(Date.now() / 1000);

      const domain = {
        name: web3Config.domain.name,
        version: web3Config.domain.version,
        chainId: web3Config.chainId,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      };

      const types = {
        Authentication: [
          { name: 'message', type: 'string' },
          { name: 'nonce', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'address', type: 'address' },
        ],
      };

      const values = {
        message: `Sign this message to authenticate with ${web3Config.domain.name}.`,
        nonce: nonce,
        timestamp: timestamp,
        address: walletAddress,
      };

      const message = {
        domain,
        types,
        primaryType: 'Authentication',
        values,
      };

      const messageKey = `web3:nonce:${walletAddress.toLowerCase()}`;

      await this.cacheManager.set(messageKey, message, web3Config.nonce.expirationTime);

      return {
        status: true,
        message: 'Nonce generated successfully',
        data: { message: message },
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.AUTHENTICATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message: error.message,
        error: errorMessage,
        errorCode,
      };
    }
  }

  /**
   * Verify EIP-712 signature
   */
  private async verifyEIP712Signature(
    walletAddress: string,
    message: any,
    signature: string,
  ): Promise<boolean> {
    try {

      if (message.values.address.toLowerCase() !== walletAddress.toLowerCase()) {
        return false;
      }

      const recoveredAddress = ethers.verifyTypedData(
        message.domain,
        message.types,
        message.values,
        signature,
      );

      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
} 