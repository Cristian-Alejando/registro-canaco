'use server'

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { enviarCorreoRegistro } from './enviarCorreoRegistro';

// Esquema estricto de validación
const registroSchema = z.object({
  nombre_completo: z.string().min(1, 'Requerido').max(120),
  correo: z.string().email('Correo inválido').max(120),
  empresa: z.string().min(1, 'Requerido').max(150),
  cargo: z.string().min(1, 'Requerido').max(100),
  ciudad: z.string().min(1, 'Requerido').max(100),
  estado: z.string().min(1, 'Requerido').max(100),
  situacion: z.string().min(1, 'Requerido').max(100),
  situacion_otra: z.string().nullable(),
  tipo_acceso: z.string().max(50),
  condicion_socio: z.string().max(50),
  numero_socio: z.string().nullable(),
  numero_asistentes: z.number().nullable(),
  retosActuales: z.array(z.string()),
  retoUrgente: z.string().nullable(),
  tiempoAccion: z.string().nullable(),
  recibir_info: z.boolean(),
  motivosAsistencia: z.array(z.string()),
  expectativaAsistencia: z.string().nullable(),
  preguntaEspecialista: z.string().nullable(),
  actividadesUtiles: z.array(z.string()),
  subtotal: z.number(),
  iva: z.number(),
  total: z.number(),
  acepto_privacidad: z.boolean(),
  url_comprobante: z.string().nullable()
});

export async function procesarRegistro(payload: any) {
  // 1. Validar los datos entrantes con Zod
  const validacion = registroSchema.safeParse(payload);
  
  if (!validacion.success) {
    console.error('Error de validación:', validacion.error.format());
    return { 
      success: false, 
      error: 'Datos inválidos o incompletos. Por favor revisa el formulario.' 
    };
  }

  const datosValidados = validacion.data;

  // 2. Insertar a Supabase con los datos validados y limpios
  try {
    const { error } = await supabase
      .from('registros_evento')
      .insert([datosValidados]);

    if (error) {
      console.error('Error al insertar en Supabase:', error);
      return { success: false, error: 'Ocurrió un error al guardar tu registro en la base de datos.' };
    }

    // 3. Enviar correo usando el Server Action existente
    try {
      await enviarCorreoRegistro(datosValidados.correo, datosValidados.nombre_completo);
    } catch (mailError) {
      console.error('Error al invocar el envío de correo:', mailError);
      // No detenemos el proceso general si el correo falla, pero se registra.
    }

    return { success: true };
  } catch (dbError) {
    console.error('Excepción crítica al guardar en Supabase:', dbError);
    return { success: false, error: 'Error interno del servidor al procesar el registro.' };
  }
}
