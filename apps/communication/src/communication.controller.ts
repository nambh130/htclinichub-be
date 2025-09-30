import { Controller } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InvitationCreated } from '@app/common/events/auth/invitation-created.event';
import { PwdRecoveryEvent } from '@app/common/events/auth/password-recovery.event';
import { SmsService } from './services/sms/sms.service';
import { SmsVerificationEvent } from '@app/common/events/auth/communication.event';

@Controller()
export class CommunicationController {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @EventPattern('invitation-created')
  sendInvitation(@Payload() invitationDto: InvitationCreated): any {
    const { roleName, clinicName, invitationUrl, to } = invitationDto;
    return this.emailService.sendInvitation(
      to,
      roleName,
      clinicName,
      invitationUrl,
    );
  }

  @EventPattern('password-recovery')
  sendResetPassword(@Payload() dto: PwdRecoveryEvent) {
    return this.emailService.sendPasswordResetEmail(dto.to, dto.resetLink);
  }

  @EventPattern('send-sms-verification-code')
  async sendSmsVerificationCode(@Payload() dto: SmsVerificationEvent) {
    console.log('SMS verification requested: ', dto);
    try {
      const result = await this.smsService.sendVerificationCode(
        dto.phoneNumber,
        dto.code,
      );
      console.log('SMS result: ', result);
      return result;
    } catch (error) {
      console.error('SMS sending failed: ', error);
      throw error;
    }
  }
}
