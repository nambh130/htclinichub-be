import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitaion.dto";
import { JwtAuthGuard } from "@app/common";
import { Authorizations } from "../guards/authorization.decorator";
import { AuthorizationGuard } from "../guards/authorization.guard";

@Controller('invitation')
export class InvitationsController {
  constructor(private readonly invitationService: InvitationsService) { }

  @Post()
  async createInvitation(@Body() createInvitationDto: CreateInvitationDto) {
    return await this.invitationService.createInvitation(createInvitationDto);
  }

  @Get()
  async getInvitationById(@Query() { token, email }: { token: string, email: string }) {
    return await this.invitationService.getInvitationByToken({ token, email });
  }
}
