import { Cache } from '@nestjs/cache-manager';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AuthClient,
  comparePassword,
  DefaultRole,
  hashPassword,
  ICreateConfirmationCodesResponse,
  IFindOrCreateUserRequest,
  IFindOrCreateUserResponse,
  IGetMeRequest,
  IGetMeResponse,
  IGetUserByIdRequest,
  IGetUserByIdResponse,
  IGetUserByLoginRequest,
  INativeLoginRequest,
  INativeLoginResponse,
  ISessionCreateRequest,
  LoginMethod,
  TwoFactorPermissionsEntity,
  UserEntity,
  UserLoginMethodsEntity,
  UserStatus,
} from '@crypton-nestjs-kit/common';
import { PermissionEntity } from '@crypton-nestjs-kit/common/build/entities/user/permissions.entity';
import { RoleEntity } from '@crypton-nestjs-kit/common/build/entities/user/role.entity';
import { UserRoleEntity } from '@crypton-nestjs-kit/common/build/entities/user/user-role.entity';
import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { uuid } from 'uuidv4';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const randomstring = require('randomstring');

const filterUser = (user: any) => {
  const { id, username, status, type, referral_code, roles, loginMethods } =
    user;

  return {
    id,
    username,
    status,
    type,
    referral_code,
    loginMethods: loginMethods.map((lm: any) => ({
      method: lm.method,
      login: lm.login,
      is_primary: lm.is_primary,
    })),
  };
};

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserLoginMethodsEntity)
    private readonly userLoginMethods: Repository<UserLoginMethodsEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(TwoFactorPermissionsEntity)
    private readonly twoFactorPermissionsRepo: Repository<TwoFactorPermissionsEntity>,
    private readonly cacheManager: Cache,
    private readonly authClient: AuthClient,
  ) {}

  async onModuleInit(): Promise<void> {
    const defaultRoles = await this.findDefaultRole();

    if (defaultRoles.length < 1) {
      await this.createDefaultRole();
    }
  }

  public async registerPermissions(request: any): Promise<any> {
    try {
      await this.permissionRepo.upsert(request.permissions, ['alias', 'route']);

      await this.updateDefaultRolePermissions(request.permissions);

      return {
        status: true,
        message: 'Permissions added',
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Permissions adding failed',
        user: null,
      };
    }
  }

  public async getPermissionList(): Promise<any> {
    try {
      const permissions = await this.permissionRepo.find();

      if (permissions.length === 0) {
        return {
          status: false,
          message: 'Permissions not found',
          permissions: [],
        };
      }

      return {
        status: true,
        message: 'Permissions added',
        permissions,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Permissions not found',
        permissions: [],
      };
    }
  }

  private async updateDefaultRolePermissions(
    permissions: PermissionEntity[],
  ): Promise<boolean> {
    const default_roles = await this.roleRepo.find({
      where: { name: In(Object.keys(DefaultRole)) },
      relations: ['permissions'],
    });

    const isUpdated = await Promise.all(
      default_roles.map(async (role) => {
        const newPermissions = permissions.filter(
          (permission) =>
            !role.permissions.some((p) => p.alias === permission.alias),
        );

        if (newPermissions.length === 0) {
          return false;
        }

        role.permissions.push(
          ...newPermissions.map((permission) =>
            this.permissionRepo.create(permission),
          ),
        );

        await this.roleRepo.save(role);

        return true;
      }),
    );

    return isUpdated.some((updated) => updated);
  }

  public async updateTwoFaPermissions(request: any): Promise<any> {
    try {
      const permissions = request.twoFaPermissions.map((permission: any) => {
        return {
          user: request.userId,
          permission: permission.permissionId,
          confirmationMethod: permission.confirmationMethodId,
        };
      });

      const a = await this.twoFactorPermissionsRepo.upsert(permissions, [
        'user',
        'permission',
        'confirmationMethod',
      ]);

      console.log(a);

      return {
        status: true,
        message: 'Permissions created',
      };
    } catch (e) {
      return {
        status: false,
        error: e.message,
        message: 'Failed to update two-factor authentication permissions',
      };
    }
  }

  public async getMe(request: IGetMeRequest): Promise<IGetMeResponse> {
    try {
      const { userId } = request;

      const userData = await this.getUserById({
        userId,
      });

      if (!userData.status) {
        return {
          status: false,
          message: 'User not found',
          user: null,
        };
      }

      const user: any = filterUser(userData.user);

      return {
        status: true,
        message: 'User found',
        user: {
          ...user,
        },
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'User not found',
        user: null,
      };
    }
  }

  public async getUserConfirmationMethods(request: any): Promise<any> {
    try {
      const confirmationMethods = await this.userLoginMethods.find({
        select: ['id', 'method', 'login', 'is_primary'],
        where: {
          user_id: request.userId,
        },
      });

      if (confirmationMethods.length === 0) {
        return {
          status: false,
          message: 'Confirmation methods not found',
          confirmationMethods: [],
        };
      }

      return {
        status: true,
        message: 'Confirmation methods found',
        confirmationMethods,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Confirmation methods not found',
        confirmationMethods: [],
      };
    }
  }

  public async findOrCreateUser(
    data: IFindOrCreateUserRequest,
  ): Promise<IFindOrCreateUserResponse> {
    try {
      const existingUser = await this.findExistingUser(
        data.login,
        UserStatus.ACTIVE,
      );

      if (existingUser) {
        return {
          status: true,
          created: false,
          message: 'User already exists',
          user: existingUser,
        };
      }

      const newUser = await this.createUser(data);

      return {
        status: true,
        message: 'User created successfully',
        created: true,
        user: newUser,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'User creation failed',
        created: false,
        user: null,
      };
    }
  }

  public async createConfirmationCodes(
    userId: v4,
    permissionId: v4,
  ): Promise<ICreateConfirmationCodesResponse> {
    try {
      const data = await this.getUserById(userId);

      const filteredTwoFaMethods = data.user.twoFaPermissions.filter(
        (twoFaPermission) =>
          twoFaPermission.permission.id === permissionId &&
          !!twoFaPermission.confirmationMethod,
      );

      if (filteredTwoFaMethods.length < 1) {
        return {
          status: false,
          message: 'Confirmation methods for permission not found',
          confirmationMethods: [],
        };
      }

      await Promise.all(
        filteredTwoFaMethods.map((method) =>
          this.crateTwoFaCode(method.confirmationMethod.id),
        ),
      );

      const confirmationMethods = filteredTwoFaMethods.map(
        (method) => method.confirmationMethod.login,
      );

      return {
        status: true,
        message: 'Confirmation codes successfully sent',
        confirmationMethods,
      };
    } catch (e) {
      return {
        status: false,
        error: e.message,
        message: 'Confirmation codes not sent',
        confirmationMethods: [],
      };
    }
  }

  public async nativeLogin(
    data: INativeLoginRequest,
  ): Promise<INativeLoginResponse> {
    try {
      const existingUser = await this.findExistingUser(
        data.login,
        UserStatus.ACTIVE,
      );

      if (!existingUser) {
        return {
          status: true,
          message: 'User not found',
          user: null,
          tokens: null,
        };
      }

      if (!(await comparePassword(data.password, existingUser.password))) {
        return {
          status: false,
          message: 'Invalid password',
          user: null,
          tokens: null,
        };
      }

      const { status, tokens, message } = await this.createAccessData({
        userId: existingUser.id,
        userAgent: data.userAgent,
        userIp: data.userIp,
        fingerprint: data.fingerprint,
        country: data.country,
        city: data.city,
        traceId: data.traceId,
      });

      if (!status) {
        return {
          status: false,
          message: 'Access token creation failed',
          user: null,
          tokens: null,
        };
      }

      return {
        status: true,
        message: 'User authenticated successfully',
        user: {
          id: existingUser.id,
          login: existingUser.login,
        },
        tokens,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'User authentication failed',
        user: null,
        tokens: null,
      };
    }
  }

  public async registrationConfirm(data: any): Promise<any> {
    try {
      const user = await this.userLoginMethods
        .createQueryBuilder('ulm')
        .innerJoin('ulm.user', 'user')
        .where('ulm.login = :login', { login: data.login })
        .andWhere('user.status = :status', { status: UserStatus.INACTIVE })
        .select([
          'user.id AS id',
          'ulm.login AS login',
          'ulm.method AS login_type',
          'ulm.code AS code',
          'ulm.code_lifetime AS code_lifetime',
        ])
        .getRawOne();

      if (!user) {
        return {
          status: false,
          message: 'User not found',
          user: null,
        };
      }

      if (+user.code !== +data.code || user.code_lifetime < new Date()) {
        return {
          status: false,
          message: 'Invalid code or code expired',
          user: null,
        };
      }

      await this.activateUser(user.id);
      await this.resetConfirmationCode(user.login, user.id);

      return {
        status: true,
        message: 'Account successfully confirmed',
      };
    } catch (e) {
      return {
        status: false,
        error: e.message,
        message: 'Account confirmation failed',
      };
    }
  }

  private async findExistingUser(
    login: string,
    status: UserStatus,
  ): Promise<{
    id: string;
    password: string;
    login: string;
    role: string;
  }> {
    return await this.userLoginMethods
      .createQueryBuilder('ulm')
      .innerJoin('ulm.user', 'user')
      .leftJoin('user.roles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .where('ulm.login = :login', { login })
      .andWhere('user.status = :status', { status })
      .select([
        'user.id AS id',
        'user.password AS password',
        'userRole.role AS role',
        'ulm.login AS login',
        'ulm.method AS login_type',
      ])
      .getRawOne();
  }

  private async createAccessData(data: ISessionCreateRequest): Promise<{
    status: boolean;
    message: string;
    tokens: any;
  }> {
    const sessionData = await this.authClient.sessionCreate(
      {
        userId: data.userId,
        userAgent: data.userAgent,
        userIp: data.userIp,
        role: data.role,
        country: data.country,
        fingerprint: data.fingerprint,
        city: data.city,
        traceId: data.traceId,
      },
      data.traceId,
    );

    if (!sessionData.status) {
      return {
        status: false,
        message: 'Session creation failed',
        tokens: null,
      };
    }

    const tokensData = await this.authClient.tokensCreate(
      {
        userId: data.userId,
        sessionId: sessionData.sessionId,
      },
      data.traceId,
    );

    if (!tokensData.status) {
      return {
        status: false,
        message: 'Session creation failed',
        tokens: null,
      };
    }

    return {
      status: true,
      message: 'Access data created successfully',
      tokens: tokensData.tokens,
    };
  }

  private async createUser(data: IFindOrCreateUserRequest): Promise<any> {
    const role = await this.roleRepo.findOne({ where: { name: 'USER' } });

    if (!role) {
      throw new Error('Role "USER" not found');
    }

    const USERNAME_PREFIX = 'user_';
    const referralCode = randomstring.generate({
      length: 10,
      charset: 'numeric',
    });
    const uniqueUsernameNumber = randomstring.generate({
      length: 10,
      charset: 'numeric',
    });

    const userId = uuid();
    const username = `${USERNAME_PREFIX}${uniqueUsernameNumber}`;

    const loginMethod = this.userLoginMethods.create({
      user_id: userId,
      method: LoginMethod[data.loginType.toUpperCase()],
      login: data.login,
      code: randomstring.generate({ length: 6, charset: 'numeric' }),
      code_lifetime: new Date(Date.now() + 5 * 60 * 1000),
    });

    const newUser = this.userRepo.create({
      id: userId,
      username,
      referral_code: referralCode,
      password: await hashPassword(data.password),
      loginMethods: [loginMethod],
    });

    const userRole = this.userRoleRepo.create({
      id: uuid(),
      user: newUser,
      role: role,
    });

    newUser.roles = [userRole];

    await this.userRepo.save(newUser);

    return {
      id: newUser.id,
      role: newUser.type,
      login: data.login,
      createdAt: newUser.created_at,
    };
  }

  private async activateUser(userId: string): Promise<any> {
    const { affected } = await this.userRepo.update(
      { id: userId },
      { status: UserStatus.ACTIVE, updated_at: new Date() },
    );

    if (affected === 0) {
      throw new Error('The user is not activated');
    }
  }

  private async resetConfirmationCode(
    login: string,
    userId: string,
  ): Promise<any> {
    const { affected } = await this.userLoginMethods.update(
      { login, user_id: userId },
      { code: null, code_lifetime: null },
    );

    if (affected == 0) {
      throw new Error('Code reset failed');
    }
  }

  public async regenerateConfirmationCode(
    userId: string,
    verificationMethod: string,
  ): Promise<any> {
    const { affected } = await this.userLoginMethods.update(
      { user_id: userId, login: verificationMethod },
      {
        code: randomstring.generate({ length: 6, charset: 'numeric' }),
        code_lifetime: new Date(Date.now() + 5 * 60 * 1000),
      },
    );

    if (affected == 0) {
      throw new Error('Code reset failed');
    }
  }

  public async crateTwoFaCode(verificationMethodId: string): Promise<any> {
    const { affected } = await this.userLoginMethods.update(
      { id: verificationMethodId },
      {
        code: randomstring.generate({ length: 6, charset: 'numeric' }),
        code_lifetime: new Date(Date.now() + 5 * 60 * 1000),
      },
    );

    if (affected == 0) {
      throw new Error('Code reset failed');
    }

    return true;
  }

  public async getUserById(
    data: IGetUserByIdRequest,
  ): Promise<IGetUserByIdResponse> {
    try {
      const CACHE_KEY = `getUserById:${data.userId}`;
      const cachedData = await this.cacheManager.get(CACHE_KEY);

      if (cachedData) {
        return {
          status: true,
          message: 'User exists',
          user: JSON.parse(cachedData.toString()),
        };
      }

      const user = await this.userRepo.findOne({
        where: {
          id: data.userId,
        },
        relations: [
          'roles.role',
          'loginMethods',
          'twoFaPermissions.permission',
          'twoFaPermissions.confirmationMethod',
        ],
      });

      if (!user) {
        return {
          status: false,
          message: 'User not found',
          user: null,
        };
      }

      await this.cacheManager.set(CACHE_KEY, JSON.stringify(user), 60 * 1000);

      return {
        status: true,
        message: 'User exists',
        user,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'User not found',
        user: null,
      };
    }
  }

  public async getUserByLogin(
    data: IGetUserByLoginRequest,
  ): Promise<IGetUserByIdResponse> {
    try {
      const CACHE_KEY = `getUserByLogin:${data.login}`;

      const cachedData = await this.cacheManager.get(CACHE_KEY);

      if (cachedData) {
        return {
          status: true,
          message: 'User exists',
          user: JSON.parse(cachedData.toString()),
        };
      }

      const user = await this.userLoginMethods
        .createQueryBuilder('ulm')
        .innerJoin('ulm.user', 'user')
        .where('ulm.login = :login', { login: data.login })
        .select([
          'user.id AS id',
          'user.password AS password',
          'ulm.login AS login',
          'ulm.method AS login_type',
        ])
        .getRawOne();

      if (!user) {
        return {
          status: false,
          message: 'User not found',
          user: null,
        };
      }

      await this.cacheManager.set(CACHE_KEY, JSON.stringify(user), 60 * 1000);

      return {
        status: true,
        message: 'User exists',
        user,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'User not found',
        user: null,
      };
    }
  }

  public async getPermissionsByRole(roleId: string): Promise<any> {
    try {
      const CACHE_KEY = `rolePermissions:${roleId}`;
      const cachedData = await this.cacheManager.get(CACHE_KEY);

      if (cachedData) {
        const data = JSON.parse(cachedData.toString());

        return {
          status: true,
          message: 'Permissions found',
          permissions: data.permissions,
        };
      }

      const role = await this.roleRepo.findOne({
        where: { id: roleId },
        relations: ['permissions'],
      });

      await this.cacheManager.set(CACHE_KEY, JSON.stringify(role), 10 * 1000);

      return {
        status: true,
        message: 'Permissions found',
        permissions: role.permissions,
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Permissions not found',
        permissions: [],
      };
    }
  }

  private async findDefaultRole(): Promise<RoleEntity[]> {
    return await this.roleRepo.find({
      where: {
        name: In(['USER', 'SUPER_ADMIN', 'ADMIN']),
      },
    });
  }

  private async createDefaultRole(): Promise<void> {
    const defaultRoles = ['USER', 'SUPER_ADMIN', 'ADMIN'];

    const rolesEntities = defaultRoles.map((role) => {
      return RoleEntity.create({
        id: v4(),
        name: role,
        description: role.toLowerCase(),
      });
    });

    await this.roleRepo.save(rolesEntities);
  }
}
