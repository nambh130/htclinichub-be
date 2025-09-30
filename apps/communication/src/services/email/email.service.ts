import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvitationEmail(to: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Invitation to join our app',
      template: './invitation', // optional if using templates
      context: {
        // optional for templating engines
        token,
      },
      html: `<p>You are invited! Use this token: <strong>${token}</strong></p>`,
    });
  }

  async sendInvitation(
    to: string,
    roleName: string,
    clinicName: string,
    invitationLink: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: 'Thư mời tham gia hệ thống.',
      template: 'invitation',
      context: {
        clinicName,
        role: roleName,
        invitationLink,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    console.log(to, resetLink);
    await this.mailerService.sendMail({
      to,
      subject: 'Khôi phục mật khẩu HTClinic hub',
      template: 'recover-password',
      context: {
        email: to,
        resetLink,
        year: new Date().getFullYear(),
      },
    });
  }
}
