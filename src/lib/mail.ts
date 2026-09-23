import nodemailer from 'nodemailer';

// Configuración del transporter usando buenas prácticas y SMTP de Microsoft 365
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Función para enviar correos transaccionales usando un alias.
 * @param options Opciones del correo (destinatario, asunto, cuerpo)
 */
export async function sendMail(options: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: '"Foro CANACO" <foro@canaco.net>', // Debe coincidir exactamente con el alias
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Correo enviado exitosamente: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error };
  }
}
