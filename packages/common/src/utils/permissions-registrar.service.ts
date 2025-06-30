import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';

import { UserClient } from '../clients';

import { CONTROLLER_META } from './controller-meta.decorator';

@Injectable()
export class PermissionsRegistrar implements OnModuleInit {
  private readonly logger = new Logger(PermissionsRegistrar.name);

  constructor(
    @Inject(DiscoveryService)
    private readonly discoveryService: DiscoveryService,
    @Inject(MetadataScanner)
    private readonly metadataScanner: MetadataScanner, // @InjectRepository(PermissionEntity) // private readonly permissionRepository: Repository<PermissionEntity>,
    @Inject(forwardRef(() => UserClient))
    private readonly userClient: UserClient,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const { permissions } = await this.userClient.getPermissionList(
        '5555555',
      );

      const permissionsList = this.extractPermissionsFromControllers();

      // console.log('permissionsList', permissionsList);

      const updatedPermissions = this.filterUpdatedPermissions(
        permissionsList,
        permissions,
      );

      console.log('updatedPermissions', updatedPermissions);

      if (updatedPermissions.length > 0) {
        await this.userClient.registerPermissions(
          { permissions: updatedPermissions },
          '5555555',
        );
      }

      // for (const permission of permissionsList) {
      //   // Проверяем, есть ли уже такой permission
      //   const exists = await this.permissionRepository.findOne({
      //     where: { alias: permission.alias },
      //   });
      //
      //   if (!exists) {
      //     await this.permissionRepository.save(permission);
      //   } else {
      //     // Можно обновлять описание/паттерн если нужно
      //     await this.permissionRepository.update(
      //       { id: exists.id },
      //       { ...permission },
      //     );
      //   }
      // }

      this.logger.log(`Permissions registered: ${permissionsList.length}`);
    } catch (e) {
      this.logger.error('Failed to register permissions', e);
    }
  }

  private extractPermissionsFromControllers(): Array<{
    method: string;
    alias: string;
    messagePattern: string;
    description: string;
    isPublic: boolean;
  }> {
    const controllers = this.discoveryService.getControllers();
    const permissionsList: Array<{
      method: string;
      alias: string;
      messagePattern: string;
      description: string;
      isPublic: boolean;
    }> = [];

    for (const controller of controllers) {
      const instance = controller.instance;
      const prototype = Object.getPrototypeOf(instance);

      this.metadataScanner
        .getAllMethodNames(prototype)
        .forEach((methodName) => {
          const method = prototype[methodName];
          const permissionMeta = Reflect.getMetadata(CONTROLLER_META, method);
          const messagePattern = Reflect.getMetadata(PATTERN_METADATA, method);

          if (messagePattern) {
            permissionsList.push({
              method: method.name,
              alias: permissionMeta?.name || null,
              messagePattern: messagePattern[0],
              description: permissionMeta?.description || null,
              isPublic: !!permissionMeta?.isPublic,
            });
          }
        });
    }

    return permissionsList;
  }

  private filterUpdatedPermissions(
    permissionsList: Array<{
      method: string;
      alias: string;
      messagePattern: string;
      description: string;
      isPublic: boolean;
    }>,
    existingPermissions: Array<{
      method: string;
      alias: string;
      messagePattern: string;
      description: string;
      isPublic: boolean;
    }>,
  ): Array<{
    method: string;
    alias: string;
    messagePattern: string;
    description: string;
    isPublic: boolean;
  }> {
    return permissionsList.filter((permission) => {
      const existingPermission = existingPermissions.find(
        (p) => p.messagePattern === permission.messagePattern,
      );

      return (
        !existingPermission ||
        existingPermission.method !== permission.method ||
        // existingPermission.alias !== permission.alias ||
        existingPermission.messagePattern !== permission.messagePattern ||
        existingPermission.description !== permission.description ||
        existingPermission.isPublic !== permission.isPublic
      );
    });
  }

  // private getMethodDescription(prototype: any, methodName: string): string {
  //   // Пример: если используете swagger decorators
  //   const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
  //   const originalMethod = descriptor?.value || prototype[methodName];
  //   const metadata = Reflect.getMetadata(
  //     'swagger/apiOperation',
  //     originalMethod,
  //   );
  //
  //   return metadata?.description || '';
  // }
}
