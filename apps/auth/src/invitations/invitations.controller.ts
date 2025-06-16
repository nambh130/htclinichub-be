import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitaion.dto";
import { Authorizations } from "../guards/authorization.decorator";
import { JwtAuthGuard } from "@app/common";
import { AuthorizationGuard } from "@app/common/auth/authorization.guard";

@Controller('invitation')
export class InvitationsController {
  constructor(private readonly invitationService: InvitationsService){}

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({
    permissions: ['create-user']
  })
  @Post()
  async createInvitation(@Body() createInvitationDto: CreateInvitationDto){
    return await this.invitationService.createInvitation(createInvitationDto);
  }

  @Get()
  async getInvitationById(@Query() {token, email}: {token: string, email: string}){
    return await this.invitationService.getInvitationByToken({token, email});
  }
}
