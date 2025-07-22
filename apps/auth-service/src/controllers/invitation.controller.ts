import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ControllerMeta,
  ControllerType,
  InvitationClientPatterns,
} from '@crypton-nestjs-kit/common';
import {
  ICancelInvitationResponse,
  ICreateInvitationRequest,
  ICreateInvitationResponse,
  IGetInvitationsRequest,
  IGetInvitationsResponse,
  IUseInvitationResponse,
} from '@crypton-nestjs-kit/common/build/interfaces/auth-service/invitation.interface';

import { InvitationService } from '../services/invitation/invitation.service';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ControllerMeta({
    name: 'Create invitation',
    description: 'Create a new invitation',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(InvitationClientPatterns.INVITATION_CREATE)
  async createInvitation(
    @Payload() data: ICreateInvitationRequest,
  ): Promise<ICreateInvitationResponse> {
    return await this.invitationService.createInvitation(data);
  }

  @ControllerMeta({
    name: 'Get invitations',
    description: 'Get invitations with filter',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(InvitationClientPatterns.INVITATION_LIST)
  async getInvitations(
    @Payload() filter: IGetInvitationsRequest,
  ): Promise<IGetInvitationsResponse> {
    return await this.invitationService.getInvitations(filter);
  }

  @ControllerMeta({
    name: 'Get invitation by code',
    description: 'Get invitation by code',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(InvitationClientPatterns.INVITATION_GET_BY_CODE)
  async getInvitationByCode(
    @Payload() data: { code: string },
  ): Promise<IUseInvitationResponse> {
    return await this.invitationService.getInvitation(data.code);
  }

  @ControllerMeta({
    name: 'Cancel invitation',
    description: 'Cancel invitation by id',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(InvitationClientPatterns.INVITATION_CANCEL)
  async cancelInvitation(
    @Payload() data: { id: string; userId: string },
  ): Promise<ICancelInvitationResponse> {
    return await this.invitationService.cancelInvitation(data.id, data.userId);
  }
}
