import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InvitationCreated } from '@app/common/events/auth/invitation-created.event';
import { PwdRecoveryEvent } from '@app/common/events/auth/password-recovery.event';

@Controller()
export class CommunicationController {
  constructor(
    private readonly emailService: EmailService
  ) { }

  @EventPattern('invitation-created')
  sendInvitation(@Payload() invitationDto: InvitationCreated): any {
    console.log("communication: ", invitationDto)
    const { roleName, clinicName, invitationUrl, to } = invitationDto
    //return this.emailService.sendInvitation(to, roleName, clinicName, invitationUrl);
    return true
  }

  @EventPattern('password-recovery')
  sendResetPassword(@Payload() dto: PwdRecoveryEvent) {
    //return this.emailService.sendPasswordResetEmail(dto.to, dto.resetLink);
    return true
  }
}
