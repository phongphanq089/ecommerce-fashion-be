import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from '@getbrevo/brevo';
import path from 'path';
import fs from 'fs';
import Mustache from 'mustache';
import juice from 'juice';
import { render } from '@react-email/render';
import { ENV_CONFIG } from '@/config/env';
import WelcomeEmail from '@/templates/emails/WelcomeEmail';
import ResetPasswordEmail from '@/templates/emails/ResetPasswordEmail';

let apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  ENV_CONFIG.BREVO_API_KEY
);

// Deprecated: Use sendReactMail instead
const sendMail = async (
  recipientEmail: string,
  customSubject: string,
  templateData: Record<string, string>,
  urlFile: string
) => {
  const verifyEmailTemplate = fs.readFileSync(path.resolve(urlFile), 'utf8');

  const htmlContent = Mustache.render(verifyEmailTemplate, templateData);

  // convert from style to inline style
  const inlineHtml = juice(htmlContent);

  // eslint-disable-next-line prefer-const
  let sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.sender = {
    email: ENV_CONFIG.ADMIN_EMAIL_ADDRESS,
    name: ENV_CONFIG.ADMIN_EMAIL_NAME,
  };
  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.subject = customSubject;
  sendSmtpEmail.htmlContent = inlineHtml;
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export type EmailTemplateName = 'WelcomeEmail' | 'ResetPasswordEmail';

const sendReactMail = async (
  recipientEmail: string,
  customSubject: string,
  templateName: EmailTemplateName,
  props: any
) => {
  let emailComponent;

  switch (templateName) {
    case 'WelcomeEmail':
      emailComponent = <WelcomeEmail {...props} />;
      break;
    case 'ResetPasswordEmail':
      emailComponent = <ResetPasswordEmail {...props} />;
      break;
    default:
      throw new Error(`Invalid email template: ${templateName}`);
  }

  const inlineHtml = await render(emailComponent);

  let sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.sender = {
    email: ENV_CONFIG.ADMIN_EMAIL_ADDRESS,
    name: ENV_CONFIG.ADMIN_EMAIL_NAME,
  };
  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.subject = customSubject;
  sendSmtpEmail.htmlContent = inlineHtml;
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
  sendMail,
  sendReactMail,
};
