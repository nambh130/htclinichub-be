import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitaion.dto";
import { CurrentUser, JwtAuthGuard, TokenPayload } from "@app/common";
import { Authorizations } from "../guards/authorization.decorator";
import { AuthorizationGuard } from "../guards/authorization.guard";
import { ActorEnum } from "@app/common/enum/actor-type";
import { InvitationByClinicDto } from "./dto/invitation-by-clinic.dto";
import { Between, FindOptionsWhere, ILike, LessThan, MoreThan } from "typeorm";
import { EmployeeInvitation } from "./models/invitation.entity";
import { ClinicUsersService } from "../clinic-users/clinic-users.service";
import { GetByIdDto } from "./dto/id-query.dto";
import { RolesService } from "../roles/roles.service";
import { P } from "pino";

@Controller('invitation')
export class InvitationsController {
  constructor(
    private readonly invitationService: InvitationsService,
    private readonly userService: ClinicUsersService,
    private readonly roleService: RolesService,
  ) { }

  @Post("clinic")
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  //@Authorizations({ permissions: ["doctor:create:permission"] })
  @Authorizations({ roles: ["doctor"] })
  async createInvitationClinic(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: TokenPayload
  ) {
    const { clinic, email, role } = createInvitationDto;

    createInvitationDto.isOwnerInvitation = false;
    if (!user.adminOf?.includes(clinic)) {
      throw new ForbiddenException("You are not authorized to do this action");
    }

    try {
      // Check if doctor has alreay in this clinic or not
      const fetchedRole = await this.roleService.getById(role);
      if (fetchedRole.roleType == ActorEnum.DOCTOR) {
        const checkUser = await this.userService.findByEmailAndClinic(
          email, clinic, ActorEnum.DOCTOR
        )
        if (checkUser) throw new BadRequestException({ ERR_CODE: "DOC_EXISTS", message: "Doctor account already exist in this clinic!" })
      }

      // Check if employee account has already exist in the system
      if (fetchedRole.roleType == ActorEnum.EMPLOYEE) {
        const checkUser = await this.userService.find(
          { email, actorType: ActorEnum.EMPLOYEE }
        )
        if (checkUser) throw new BadRequestException({ ERR_CODE: "EMPLOYEE_EXISTS", message: "Employee account already exist!" })
      }
    } catch (error) {
      console.log(error)
    }

    return await this.invitationService.createInvitation(
      createInvitationDto,
      { id: user.userId, type: user.actorType });
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({ roles: ["admin"] })
  //@Authorizations({ permissions: ["admin:create:permission"] })
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

  @Patch(':id/revoke')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({ roles: ['doctor'] })
  async revokeInvitation(
    @Param() param: GetByIdDto,
    @Body() body: { clinicId: string },
    @CurrentUser() user: TokenPayload
  ) {
    const foundUser = await this.userService.find(
      { id: user.userId }
    );

    const isLinked = foundUser?.clinics.some((c) => c.id === body.clinicId);
    if (!isLinked) {
      throw new ForbiddenException("Unauthorize to query this clinic");
    }

    const response = await this.invitationService.updateInvitationStatus(param.id, 'revoked');
    return response;
  }

  @Get('clinic')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({ roles: ['doctor'] })
  async getInvitationByClinic(
    @Query() dto: InvitationByClinicDto,
    @CurrentUser() user: TokenPayload
  ) {
    const foundUser = await this.userService.find(
      { id: user.userId }
    );

    const isLinked = foundUser?.clinics.some((c) => c.id === dto.clinicId);
    if (!isLinked) {
      throw new ForbiddenException("Unauthorize to query this clinic");
    }

    const { limit, page } = dto;
    const filter = this.buildWhereFromDto(dto);
    const result = await this.invitationService.getInvitation(
      { limit, page, where: filter }
    );
    const userIds = result.data.map(invite => invite.createdById)
    const creators = await this.userService.findUserByIds(userIds);
    const morphedInvitations = result.data.map(invite => {
      const creator = creators.find(item => item.id == invite.createdById);
      return ({
        id: invite.id,
        email: invite.email,
        role: invite.role.name,
        invitedBy: { email: creator?.email, actorType: creator?.actorType },
        status: invite.status,
        expiresAt: invite.expires_at,
        createdAt: invite.createdAt,
        isOwnerInvitation: invite.isOwnerInvitation
      })
    });

    return {
      data: morphedInvitations,
      total: result.total
    };
  }

  buildWhereFromDto(dto: InvitationByClinicDto): FindOptionsWhere<EmployeeInvitation> {
    const where: FindOptionsWhere<EmployeeInvitation> = {};

    if (dto.email) where.email = ILike(`%${dto.email}%`);
    if (dto.clinicId) where.clinic = { id: dto.clinicId };
    if (dto.roleId) where.role = { id: dto.roleId };
    if (dto.invitedById) where.invitedBy = { id: dto.invitedById };
    //if (dto.isOwnerInvitation !== undefined) where.isOwnerInvitation = dto.isOwnerInvitation;
    if (dto.status) where.status = dto.status;

    if (dto.createdBefore || dto.createdAfter) {
      if (dto.createdBefore && dto.createdAfter) {
        where.createdAt = Between(new Date(dto.createdAfter), new Date(dto.createdBefore));
      } else if (dto.createdBefore) {
        where.createdAt = LessThan(new Date(dto.createdBefore));
      } else if (dto.createdAfter) {
        where.createdAt = MoreThan(new Date(dto.createdAfter));
      }
    }

    if (dto.expiresBefore || dto.expiresAfter) {
      const conditions: any = {};
      if (dto.expiresBefore) conditions.lessThan = new Date(dto.expiresBefore);
      if (dto.expiresAfter) conditions.moreThan = new Date(dto.expiresAfter);
      where.expires_at = conditions;
    }

    return where;
  }
}
