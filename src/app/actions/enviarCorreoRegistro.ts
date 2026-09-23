'use server'

import { sendMail } from '@/lib/mail';

export async function enviarCorreoRegistro(correoDestino: string, nombre: string) {
  try {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Registro Exitoso!</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hola <strong>${nombre}</strong>,</p>
          <p style="font-size: 16px;">Tu registro para el <strong>Foro CANACO</strong> se ha completado con éxito.</p>
          <p style="font-size: 16px;">Te esperamos el próximo <strong>5 de noviembre</strong> en Cintermex Magnosalon de 8:00 am a 5:00 pm.</p>
          <br/>
          <p style="font-size: 16px;">¡Gracias por participar!</p>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <div style="font-size: 14px; color: #555;">
            <p style="margin: 0; line-height: 1.4;"><strong style="color: #1e3a8a;">Comité Organizador | Foro CANACO 2026</strong></p>
            <p style="margin: 0; line-height: 1.4;">Relaciones Institucionales</p>
            <p style="margin: 0; line-height: 1.4;">Correo: foro@canaco.net | Tel. (81) 8150 2424 ext. 129</p>
            <p style="margin: 0; line-height: 1.4;">www.canaco.net | /canacomonterrey</p>
            <p style="margin: 10px 0 0 0; line-height: 1.4; font-size: 12px;">
              <a href="#" style="color: #1e3a8a; text-decoration: underline;">Conoce nuestro aviso de privacidad</a>
            </p>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">Foro CANACO - Todos los derechos reservados</p>
        </div>
      </div>
    `;

    await sendMail({
      to: correoDestino,
      subject: 'Confirmación de Registro - Foro CANACO',
      html: htmlBody,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo de confirmación de registro:', error);
    return { success: false };
  }
}
