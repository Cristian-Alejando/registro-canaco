export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      registros_evento: {
        Row: {
          id: number
          created_at: string
          nombre_completo: string
          correo: string
          empresa: string | null
          cargo: string | null
          ciudad: string
          estado: string
          situacion: string
          situacion_otra: string | null
          tipo_acceso: string
          condicion_socio: string
          numero_socio: string | null
          numero_asistentes: number | null
          retosActuales: string[] | null
          retoUrgente: string | null
          tiempoAccion: string | null
          recibir_info: boolean
          motivosAsistencia: string[] | null
          expectativaAsistencia: string | null
          preguntaEspecialista: string | null
          actividadesUtiles: string[] | null
          subtotal: number
          iva: number
          total: number
          acepto_privacidad: boolean
          url_comprobante?: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          nombre_completo: string
          correo: string
          empresa?: string | null
          cargo?: string | null
          ciudad: string
          estado: string
          situacion: string
          situacion_otra?: string | null
          tipo_acceso: string
          condicion_socio: string
          numero_socio?: string | null
          numero_asistentes?: number | null
          retosActuales?: string[] | null
          retoUrgente?: string | null
          tiempoAccion?: string | null
          recibir_info: boolean
          motivosAsistencia?: string[] | null
          expectativaAsistencia?: string | null
          preguntaEspecialista?: string | null
          actividadesUtiles?: string[] | null
          subtotal: number
          iva: number
          total: number
          acepto_privacidad: boolean
          url_comprobante?: string | null
        }
        Update: Partial<Database['public']['Tables']['registros_evento']['Insert']>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
