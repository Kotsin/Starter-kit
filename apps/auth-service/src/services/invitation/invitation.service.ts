import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DefaultRole,
  InvitationChanel,
  InvitationEntity,
  InvitationStatus,
  IRole,
  UserClient,
} from '@crypton-nestjs-kit/common';
import {
  AUTH_ERROR_CODES,
  AuthErrorMessages,
  generateRandomString,
} from '@crypton-nestjs-kit/common';
import {
  ICancelInvitationResponse,
  ICreateInvitationRequest,
  ICreateInvitationResponse,
  IGetInvitationsRequest,
  IGetInvitationsResponse,
  IUseInvitationResponse,
} from '@crypton-nestjs-kit/common/src/interfaces/auth-service/invitation.interface';
import { In, Repository } from 'typeorm';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly invitationRepo: Repository<InvitationEntity>,
    private readonly userClient: UserClient,
  ) {}

  /**
   * Создать приглашение
   */
  async createInvitation(
    data: ICreateInvitationRequest,
  ): Promise<ICreateInvitationResponse> {
    try {
      if (!data.contact || !['email', 'phone'].includes(data.channel)) {
        return {
          status: false,
          message: AuthErrorMessages[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
          error: null,
          errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        };
      }

      if (new Date(data.expiresAt) < new Date()) {
        return {
          status: false,
          message:
            AuthErrorMessages[AUTH_ERROR_CODES.INVITATION_EXPIRED_AT_NOT_VALID],
          error: null,
          errorCode: AUTH_ERROR_CODES.INVITATION_EXPIRED_AT_NOT_VALID,
        };
      }

      const role = await this.userClient.getRoleById(
        { roleId: data.invitedUserRole },
        data.traceId,
        'service',
      );

      if (!role.status) {
        return {
          status: false,
          message:
            AuthErrorMessages[AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND],
          errorCode: AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND,
        };
      }

      const isPermission = await this.checkRoleLevelPermission(
        role.role,
        data.userId,
        data.traceId,
      );

      if (!isPermission) {
        return {
          status: false,
          message:
            AuthErrorMessages[AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND],
          errorCode: AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND,
        };
      }

      if (role.role.name === DefaultRole.SUPER_ADMIN) {
        return {
          status: false,
          message:
            AuthErrorMessages[AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND],
          errorCode: AUTH_ERROR_CODES.INVITATION_ROLE_NOT_FOUND,
        };
      }

      const existingInvitation = await this.invitationRepo.findOne({
        where: {
          contact: data.contact,
          status: In([InvitationStatus.ACTIVE, InvitationStatus.USED]),
          channel:
            data.channel === 'email'
              ? InvitationChanel.EMAIL
              : InvitationChanel.PHONE,
        },
      });

      if (existingInvitation) {
        return {
          status: false,
          message:
            AuthErrorMessages[AUTH_ERROR_CODES.INVITATION_ALREADY_EXISTS],
          error: null,
          errorCode: AUTH_ERROR_CODES.INVITATION_ALREADY_EXISTS,
        };
      }

      const code = generateRandomString(15, 'CRYPTON');
      const invitationEntity = {
        ...data,
        createdBy: data.userId,
        code,
        status: InvitationStatus.ACTIVE,
        channel:
          data.channel === 'email'
            ? InvitationChanel.EMAIL
            : InvitationChanel.PHONE,
      };
      const invitation = this.invitationRepo.create(invitationEntity);

      await this.invitationRepo.save(invitation);

      // TODO: отправка уведомления по email/phone
      return {
        status: true,
        message: 'Invitation created',
        invitation,
      };
    } catch (error) {
      console.log(error);

      return {
        status: false,
        message:
          error.message || AuthErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      };
    }
  }

  private async checkRoleLevelPermission(
    role: IRole,
    userId: string,
    traceId: string,
  ): Promise<boolean> {
    const userRole = await this.userClient.getRoleByUserId(
      userId,
      traceId,
      'service',
    );

    if (userRole.status) {
      return userRole.roles.some((userRole) => userRole.level < role.level);
    }

    return false;
  }

  /**
   * Получить список приглашений с гибкой фильтрацией и пагинацией
   */
  async getInvitations(
    filter: IGetInvitationsRequest = {},
  ): Promise<IGetInvitationsResponse> {
    try {
      const qb = this.invitationRepo.createQueryBuilder('invitation');

      qb.andWhere('invitation.createdBy = :createdBy', {
        createdBy: filter.userId,
      });

      // Фильтрация по статусу
      if (filter.status) {
        if (filter.status === 'active') {
          qb.andWhere('invitation.status = :status', {
            status: InvitationStatus.ACTIVE,
          });
          qb.andWhere('invitation.expiresAt > :now', { now: new Date() });
        } else if (filter.status === 'expired') {
          qb.andWhere('invitation.status = :status', {
            status: InvitationStatus.ACTIVE,
          });
          qb.andWhere('invitation.expiresAt < :now', { now: new Date() });
        } else {
          qb.andWhere('invitation.status = :status', { status: filter.status });
        }
      }

      const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
      const page = filter.page && filter.page > 0 ? filter.page : 1;
      const skip = (page - 1) * limit;

      qb.orderBy('invitation.createdAt', 'ASC');
      qb.take(limit);
      qb.skip(skip);

      const count = await qb.getCount();
      const invitations = await qb.getMany();

      console.log('Query parameters:', qb.getParameters());
      console.log('Count:', count);
      console.log('Invitations found:', invitations.length);

      return {
        status: true,
        message: 'Invitations found',
        invitations,
        count,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getInvitations:', error);

      return {
        status: false,
        message:
          error.message || AuthErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        invitations: [],
        count: 0,
        page: filter.page || 1,
        limit: filter.limit || 20,
      };
    }
  }

  /**
   * Получить приглашение по коду
   */
  async getInvitation(code: string): Promise<IUseInvitationResponse> {
    try {
      const invitation = await this.invitationRepo.findOne({ where: { code } });

      if (!invitation) {
        return { status: false, message: 'Invitation not found', error: null };
      }

      if (invitation.status !== 'active' || invitation.expiresAt < new Date()) {
        return {
          status: false,
          message: 'Invitation is not active or expired',
          error: null,
        };
      }

      return { status: true, message: 'Invitation found', invitation };
    } catch (error) {
      return { status: false, message: error.message, error: error.message };
    }
  }

  /**
   * Отменить приглашение (если оно не использовано)
   */
  async cancelInvitation(
    id: string,
    userId: string,
  ): Promise<ICancelInvitationResponse> {
    try {
      const invitation = await this.invitationRepo.findOne({
        where: { id, createdBy: userId },
      });

      if (!invitation) {
        return { status: false, message: 'Invitation not found', error: null };
      }

      if (invitation.status !== InvitationStatus.ACTIVE) {
        return {
          status: false,
          message: 'Invitation is not active',
          error: null,
        };
      }

      // Обновляем статус через QueryBuilder
      const updateResult = await this.invitationRepo
        .createQueryBuilder()
        .update(InvitationEntity)
        .set({ status: InvitationStatus.CANCELLED })
        .where('id = :id', { id })
        .andWhere('createdBy = :createdBy', { createdBy: userId })
        .andWhere('status = :status', { status: InvitationStatus.ACTIVE })
        .execute();

      if (updateResult.affected === 0) {
        return {
          status: false,
          message: 'Failed to cancel invitation',
          error: null,
        };
      }

      // Обновляем объект для возврата
      invitation.status = InvitationStatus.CANCELLED;

      return { status: true, message: 'Invitation cancelled', invitation };
    } catch (error) {
      return { status: false, message: error.message, error };
    }
  }

  /**
   * Использовать приглашение (отметить как использованное)
   */
  async useInvitation(
    code: string,
    usedBy: string,
  ): Promise<IUseInvitationResponse> {
    try {
      const invitation = await this.invitationRepo.findOne({ where: { code } });

      if (!invitation) {
        return { status: false, message: 'Invitation not found', error: null };
      }

      if (invitation.status !== 'active' || invitation.expiresAt < new Date()) {
        return {
          status: false,
          message: 'Invitation is not active or expired',
          error: null,
        };
      }

      invitation.status = InvitationStatus.USED;
      invitation.usedBy = usedBy;
      await this.invitationRepo.save(invitation);

      return { status: true, message: 'Invitation used', invitation };
    } catch (error) {
      return { status: false, message: error.message, error };
    }
  }
}
