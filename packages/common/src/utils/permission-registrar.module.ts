import { forwardRef, Module } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';

import { ClientUserModule } from '../clients';

import { PermissionsRegistrar } from './permissions-registrar.service';

@Module({
  imports: [forwardRef(() => ClientUserModule)],
  providers: [DiscoveryService, MetadataScanner, PermissionsRegistrar],
  exports: [PermissionsRegistrar],
})
export class PermissionsRegistrarModule {}
