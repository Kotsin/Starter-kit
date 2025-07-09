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
      const cachedMessage = await this.cacheManager.get<string>(nonceKey);

      if (!cachedMessage) {
        throw new AuthenticationError(
          'Nonce not found or expired',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // парсим данные nonce из кэша
      const messageData = JSON.parse(cachedMessage); // TODO: возможно запутался в структурах
      const { nonce, message: originalMessage } = messageData;

      // проверяем подпись
      const isValidSignature = await this.verifyEIP712Signature(
        walletAddress,
        originalMessage,
        signature,
        nonce,
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
      const userResult = await this.userClient.findOrCreateUser(
        {
          login: walletAddress.toLowerCase(),
          loginType: LoginMethod.WEB3,
          password: '', // нет пароля для веб3 аутентификации?
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
    data?: { message: string };
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

      const message = JSON.stringify({ // TODO: отдать структуру в виде объекта, а не строки
        domain,
        types,
        primaryType: 'Authentication',
        message: values,
      });

      const messageKey = `web3:nonce:${walletAddress.toLowerCase()}`;
      const messageData = {
        nonce,
        message,
        timestamp,
        walletAddress: walletAddress.toLowerCase(),
      };

      await this.cacheManager.set(messageKey, JSON.stringify(messageData), web3Config.nonce.expirationTime);

      return {
        status: true,
        message: 'Nonce generated successfully',
        nonce: nonce.toString(),
        data: { message },
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
    message: string,
    signature: string,
    expectedNonce: number,
  ): Promise<boolean> {
    try {
      const structuredData = JSON.parse(message);

      if (structuredData.message.nonce !== expectedNonce) {
        return false;
      }

      if (structuredData.message.address.toLowerCase() !== walletAddress.toLowerCase()) {
        return false;
      }

      const recoveredAddress = ethers.verifyTypedData(
        structuredData.domain,
        structuredData.types,
        structuredData.message,
        signature,
      );

      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
} 