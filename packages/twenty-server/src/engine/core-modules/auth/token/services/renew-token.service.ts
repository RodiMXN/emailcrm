import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class RenewTokenService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceAgnosticTokenService: WorkspaceAgnosticTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessOrWorkspaceAgnosticToken: AuthToken;
    refreshToken: AuthToken;
  }>;
  async generateTokensFromRefreshToken(
    token: string,
    preferredWorkspaceId?: string,
  ): Promise<{
    accessOrWorkspaceAgnosticToken: AuthToken;
    refreshToken: AuthToken;
  }>;
  async generateTokensFromRefreshToken(
    token: string,
    preferredWorkspaceId?: string,
  ): Promise<{
    accessOrWorkspaceAgnosticToken: AuthToken;
    refreshToken: AuthToken;
  }> {
    if (!token) {
      throw new AuthException(
        'Refresh token not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const {
      user,
      token: { id, workspaceId },
      authProvider,
      targetedTokenType: targetedTokenTypeFromPayload,
      isImpersonating,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId,
    } = await this.refreshTokenService.verifyRefreshToken(token);

    // Revoke old refresh token only if not already revoked.
    // If it was already revoked (concurrent race condition within grace
    // period), we preserve the original revokedAt timestamp so the grace
    // window stays anchored and cannot be extended by repeated reuse.
    await this.appTokenRepository.update(
      {
        id,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );

    // Support legacy token when targetedTokenType is undefined.
    const targetedTokenType =
      targetedTokenTypeFromPayload ?? JwtTokenTypeEnum.ACCESS;
    const workspaceIdToIssueAccessTokenFor =
      await this.resolveWorkspaceIdForAccessToken({
        workspaceId,
        targetedTokenType,
        userId: user.id,
        preferredWorkspaceId,
      });

    const resolvedAuthProvider = authProvider ?? AuthProviderEnum.Password;

    const accessToken = !isDefined(workspaceIdToIssueAccessTokenFor)
      ? await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
          {
            userId: user.id,
            authProvider: resolvedAuthProvider,
          },
        )
      : await this.accessTokenService.generateAccessToken({
          userId: user.id,
          workspaceId: workspaceIdToIssueAccessTokenFor,
          authProvider: resolvedAuthProvider,
          isImpersonating,
          impersonatorUserWorkspaceId,
          impersonatedUserWorkspaceId,
        });

    const refreshTokenTargetedTokenType = isDefined(
      workspaceIdToIssueAccessTokenFor,
    )
      ? JwtTokenTypeEnum.ACCESS
      : targetedTokenType;

    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      userId: user.id,
      workspaceId: workspaceIdToIssueAccessTokenFor,
      authProvider: resolvedAuthProvider,
      targetedTokenType: refreshTokenTargetedTokenType,
      isImpersonating,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId,
    });

    return {
      accessOrWorkspaceAgnosticToken: accessToken,
      refreshToken,
    };
  }

  private async resolveWorkspaceIdForAccessToken({
    workspaceId,
    targetedTokenType,
    userId,
    preferredWorkspaceId,
  }: {
    workspaceId?: string;
    targetedTokenType: JwtTokenTypeEnum;
    userId: string;
    preferredWorkspaceId?: string;
  }): Promise<string | undefined> {
    if (isDefined(workspaceId)) {
      return workspaceId;
    }

    if (isDefined(preferredWorkspaceId)) {
      return preferredWorkspaceId;
    }

    if (targetedTokenType !== JwtTokenTypeEnum.WORKSPACE_AGNOSTIC) {
      return undefined;
    }

    if (this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
      return undefined;
    }

    const latestUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!isDefined(latestUserWorkspace)) {
      return undefined;
    }

    return latestUserWorkspace.workspaceId;
  }
}
