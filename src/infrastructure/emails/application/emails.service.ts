import { Injectable } from '@nestjs/common'
import path from 'path'
import ejs from 'ejs'
import { MailerService } from '@nestjs-modules/mailer'

type EmailConfig = {
  email: string
  subject: string
  templatePath: string
  templateData: { [name: string]: any }
}

@Injectable()
export class EmailsService {
  constructor(private readonly mailerService: MailerService) {}

  private async renderTemplate(templatePath: string, templateData: object): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(path.join(__dirname, '..', 'templates', templatePath), templateData, (err, html) => {
        if (err) {
          reject(err)
        } else {
          resolve(html)
        }
      })
    })
  }

  async sendEmail(config: EmailConfig): Promise<void> {
    const html = await this.renderTemplate(config.templatePath, config.templateData)

    await this.mailerService
      .sendMail({
        from: `"Andrew" <${process.env.EMAIL_USER}>`,
        to: config.email,
        subject: config.subject,
        html,
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  async sendRegistrationConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
    await this.sendEmail({
      email,
      subject: 'Registration Confirmation',
      templatePath: 'confirmationEmail.ejs',
      templateData: { confirmationCode },
    })
  }

  async sendPasswordRecoveryEmail(email: string, recoveryCode: string): Promise<void> {
    await this.sendEmail({
      email,
      subject: 'Password Recovery',
      templatePath: 'passwordRecoveryEmail.ejs',
      templateData: { recoveryCode },
    })
  }
}
