import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitaion.dto";
import { CurrentUser, JwtAuthGuard, TokenPayload } from "@app/common";
import { Authorizations } from "../guards/authorization.decorator";
import { AuthorizationGuard } from "../guards/authorization.guard";
import { ActorEnum } from "@app/common/enum/actor-type";

@Controller('invitation')
export class InvitationsController {
  constructor(private readonly invitationService: InvitationsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  //@Authorizations({ permissions: ["doctor:create:permission"] })
  async createInvitationClinic(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: TokenPayload
  ) {
    const { clinic } = createInvitationDto;
    if (user.actorType == ActorEnum.DOCTOR) {
      createInvitationDto.isOwnerInvitation = false;
      if (!user.adminOf?.includes(clinic)) {
        throw new UnauthorizedException("You are not authorized to do this action");
      }
    }

    return await this.invitationService.createInvitation(
      createInvitationDto,
      { id: user.userId, type: user.actorType });
  }

  @Post()
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({ permissions: ["admin:create:permission"] })
  async createInvitationAdmin(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: TokenPayload
  ) {
    return await this.invitationService.createInvitation(
      createInvitationDto,
      { id: user.userId, type: user.actorType });
  }

  @Get()
  async getInvitationById(@Query() { token, email }: { token: string, email: string }) {
    return await this.invitationService.getInvitationByToken({ token, email });
  }
}
