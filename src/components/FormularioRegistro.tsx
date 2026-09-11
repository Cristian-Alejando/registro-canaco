"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

// Sanitización básica para prevenir Inyecciones HTML (XSS)
const sanitizeText = (text: string | null | undefined) => {
  if (!text) return text;
  // Remueve cualquier etiqueta HTML usando regex
  return text.replace(/<[^>]*>?/gm, '').trim();
};

type FormData = {
  nombre: string;
  correo: string;
  empresa: string;
  cargo: string;
  ciudad: string;
  estado: string;
  situacionActual: string;
  situacionOtra: string;
  tipoAcceso: string;
  condicion: string;
  numeroAsistentes: number;
  retos: string[];
  pregunta5: string;
  pregunta6: string;
  privacidad: boolean;
  motivaciones?: string[];
  motivaciones_otro?: string;
  retos_otro?: string;
  expectativa?: string;
  expectativa_otro?: string;
  pregunta_especialistas?: string;
  tipo_actividad?: string;
};

export default function FormularioRegistro() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      retos: [],
      tipoAcceso: 'Individual',
      condicion: 'No socio',
      privacidad: false
    }
  });

  const watchSituacion = watch('situacionActual');
  const watchTipoAcceso = watch('tipoAcceso');
  const watchRetos = watch('retos') || [];
  
  const omitir5y6 = watchRetos.includes('Por ahora no enfrento un reto específico...');

  useEffect(() => {
    if (omitir5y6) {
      setValue('pregunta5', 'Estoy explorando');
      setValue('pregunta6', 'No aplica');
    }
    // Hace exclusiva la opción "Por ahora no enfrento un reto específico..."
    if (omitir5y6 && watchRetos.length > 1) {
      setValue('retos', ['Por ahora no enfrento un reto específico...']);
    }
  }, [omitir5y6, watchRetos, setValue]);

  const nextStep = async () => {
    let fieldsToValidate: any = [];
    if (step === 1) {
      fieldsToValidate = ['nombre', 'correo', 'ciudad', 'estado', 'situacionActual'];
      if (watchSituacion === 'Otra') fieldsToValidate.push('situacionOtra');
    } else if (step === 2) {
      fieldsToValidate = ['tipoAcceso', 'condicion'];
      if (watchTipoAcceso === 'Grupal') fieldsToValidate.push('numeroAsistentes');
    } else if (step === 3) {
      fieldsToValidate = ['retos'];
      if (!omitir5y6) {
        fieldsToValidate.push('pregunta5', 'pregunta6');
      }
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const payload = {
        nombre_completo: sanitizeText(data.nombre),
        correo: sanitizeText(data.correo),
        empresa: sanitizeText(data.empresa) || null,
        cargo: sanitizeText(data.cargo) || null,
        ciudad: sanitizeText(data.ciudad),
        estado: sanitizeText(data.estado),
        situacion: sanitizeText(data.situacionActual),
        situacion_otra: sanitizeText(data.situacionOtra) || null,
        tipo_acceso: sanitizeText(data.tipoAcceso),
        condicion_socio: sanitizeText(data.condicion),
        numero_asistentes: data.numeroAsistentes || null,
        retos: data.retos ? data.retos.map(r => sanitizeText(r) as string) : null,
        prioridad_reto: sanitizeText(data.pregunta5) || null,
        urgencia_acciones: sanitizeText(data.pregunta6) || null,
        recibir_info: data.privacidad,
        motivaciones: data.motivaciones ? data.motivaciones.map(m => sanitizeText(m) as string) : null,
        motivaciones_otro: sanitizeText(data.motivaciones_otro) || null,
        retos_otro: sanitizeText(data.retos_otro) || null,
        expectativa: sanitizeText(data.expectativa) || null,
        expectativa_otro: sanitizeText(data.expectativa_otro) || null,
        pregunta_especialistas: sanitizeText(data.pregunta_especialistas) || null,
        tipo_actividad: sanitizeText(data.tipo_actividad) || null
      };

      const { error } = await supabase
        .from('registros_evento')
        .insert([payload]);

      if (error) throw error;

      setStatus('success');
    } catch (error: any) {
      console.error("Error crítico al registrar (posible volcado de DB):", error);
      setStatus('error');
      // Prevención de Information Disclosure: se oculta el error real de Supabase
      setErrorMessage('Ocurrió un error al procesar tu registro. Por favor, intenta de nuevo más tarde.');
    }
  };

  const inputClass = (fieldName: keyof FormData) => `w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-gray-900 ${
    errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
  }`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
      {/* Barra de progreso */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3 relative z-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? 'bg-blue-900 text-white shadow-md scale-110' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
              {s}
            </div>
          ))}
        </div>
        <div className="relative -mt-8 mb-8 z-0 px-2">
          <div className="h-1.5 w-full bg-gray-100 rounded-full absolute top-4 left-0"></div>
          <div className="h-1.5 bg-blue-900 rounded-full absolute top-4 left-0 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8 text-center tracking-tight">
        {step === 1 && "Perfil del Asistente"}
        {step === 2 && "Detalles de Acceso"}
        {step === 3 && "Retos y Objetivos"}
        {step === 4 && "Confirmación"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* PANTALLA 1: Perfil */}
        <div className={step === 1 ? 'block animate-fade-in' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Nombre completo *</label>
              <input 
                {...register('nombre', { required: 'Obligatorio', maxLength: { value: 120, message: 'Máximo 120 caracteres' } })} 
                className={inputClass('nombre')} 
                placeholder="Ej. Juan Pérez"
              />
              {errors.nombre && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.nombre.message}</span>}
            </div>
            
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Correo electrónico *</label>
              <input 
                type="email" 
                {...register('correo', { required: 'Obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })} 
                className={inputClass('correo')} 
                placeholder="tu@email.com"
              />
              {errors.correo && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.correo.message}</span>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Empresa (opcional)</label>
              <input {...register('empresa')} className={inputClass('empresa')} placeholder="Nombre de tu empresa" />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Cargo (opcional)</label>
              <input {...register('cargo')} className={inputClass('cargo')} placeholder="Tu cargo" />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Ciudad *</label>
              <input {...register('ciudad', { required: 'Obligatorio' })} className={inputClass('ciudad')} placeholder="Ej. Ciudad de México" />
              {errors.ciudad && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.ciudad.message}</span>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Estado *</label>
              <input {...register('estado', { required: 'Obligatorio' })} className={inputClass('estado')} placeholder="Ej. CDMX" />
              {errors.estado && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.estado.message}</span>}
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Situación actual *</label>
              <select {...register('situacionActual', { required: 'Obligatorio' })} className={inputClass('situacionActual')}>
                <option value="">Selecciona una opción</option>
                <option value="Emprendedor">Emprendedor</option>
                <option value="Estudiante">Estudiante</option>
                <option value="Profesional independiente">Profesional independiente</option>
                <option value="Empleado">Empleado</option>
                <option value="Otra">Otra</option>
              </select>
              {errors.situacionActual && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.situacionActual.message}</span>}
            </div>

            {watchSituacion === 'Otra' && (
              <div className="md:col-span-2 flex flex-col animate-fade-in">
                <label className="mb-2 text-sm font-semibold text-gray-700">Especifica tu situación *</label>
                <input {...register('situacionOtra', { required: 'Obligatorio' })} className={inputClass('situacionOtra')} placeholder="Describe tu situación" />
                {errors.situacionOtra && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.situacionOtra.message}</span>}
              </div>
            )}
          </div>
        </div>

        {/* PANTALLA 2: Accesos */}
        <div className={step === 2 ? 'block animate-fade-in' : 'hidden'}>
          <div className="space-y-8">
            <div className="flex flex-col space-y-4">
              <label className="text-base font-semibold text-gray-800">Tipo de acceso *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${watchTipoAcceso === 'Individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" value="Individual" {...register('tipoAcceso', { required: 'Obligatorio' })} className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-800">Individual</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${watchTipoAcceso === 'Grupal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" value="Grupal" {...register('tipoAcceso', { required: 'Obligatorio' })} className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-800">Grupal</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <label className="text-base font-semibold text-gray-800">Condición *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${watch('condicion') === 'Socio' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" value="Socio" {...register('condicion', { required: 'Obligatorio' })} className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-800">Socio</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${watch('condicion') === 'No socio' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" value="No socio" {...register('condicion', { required: 'Obligatorio' })} className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-800">No socio</span>
                </label>
              </div>
            </div>

            {watchTipoAcceso === 'Grupal' && (
              <div className="flex flex-col pt-2 animate-fade-in">
                <label className="mb-2 text-sm font-semibold text-gray-700">Número de asistentes * (Mínimo 5)</label>
                <input 
                  type="number" 
                  {...register('numeroAsistentes', { 
                    required: 'Obligatorio', 
                    min: { value: 5, message: 'El mínimo es 5 asistentes' },
                    validate: v => Number.isInteger(v) || 'Debe ser un número entero',
                    valueAsNumber: true
                  })} 
                  className={inputClass('numeroAsistentes')} 
                  placeholder="Ej. 5"
                />
                {errors.numeroAsistentes && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.numeroAsistentes.message}</span>}
              </div>
            )}
          </div>
        </div>

        {/* PANTALLA 3: Retos */}
        <div className={step === 3 ? 'block animate-fade-in' : 'hidden'}>
          <div className="space-y-8">
            <div className="flex flex-col">
              <label className="text-base font-semibold text-gray-800 mb-4">4. ¿Cuáles son tus principales retos? (Selecciona hasta 3) *</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Ventas y marketing', 
                  'Operaciones y logística', 
                  'Finanzas y contabilidad', 
                  'Recursos humanos', 
                  'Tecnología e innovación', 
                  'Por ahora no enfrento un reto específico...'
                ].map(opcion => {
                  const isChecked = watchRetos.includes(opcion);
                  const isDisabled = (omitir5y6 && opcion !== 'Por ahora no enfrento un reto específico...') || 
                                     (!isChecked && watchRetos.length >= 3);
                  return (
                    <label key={opcion} className={`flex items-center p-3 border rounded-xl transition-colors ${isChecked ? 'border-blue-600 bg-blue-50' : 'border-gray-200'} ${isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'cursor-pointer hover:border-blue-300'}`}>
                      <input 
                        type="checkbox" 
                        value={opcion} 
                        {...register('retos', {
                          validate: v => {
                            if (!v || v.length === 0) return 'Selecciona al menos una opción';
                            if (v.length > 3) return 'Máximo 3 opciones permitidas';
                            return true;
                          }
                        })} 
                        disabled={isDisabled}
                        className="w-5 h-5 text-blue-900 focus:ring-blue-900 rounded border-gray-300" 
                      />
                      <span className="ml-3 text-sm font-medium text-gray-800">{opcion}</span>
                    </label>
                  );
                })}
              </div>
              {errors.retos && <span className="text-red-500 text-sm mt-2 font-medium">{errors.retos.message}</span>}
            </div>

            {!omitir5y6 && (
              <div className="space-y-6 pt-6 border-t border-gray-100 animate-fade-in">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">5. ¿Qué área de interés tienes? *</label>
                  <select {...register('pregunta5', { required: 'Obligatorio' })} className={inputClass('pregunta5')}>
                    <option value="">Selecciona una opción</option>
                    <option value="Estoy explorando">Estoy explorando</option>
                    <option value="Networking">Networking</option>
                    <option value="Capacitación">Capacitación</option>
                    <option value="Inversión">Inversión</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.pregunta5 && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.pregunta5.message}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">6. ¿Qué expectativa tienes del evento? *</label>
                  <select {...register('pregunta6', { required: 'Obligatorio' })} className={inputClass('pregunta6')}>
                    <option value="">Selecciona una opción</option>
                    <option value="No aplica">No aplica</option>
                    <option value="Conocer proveedores">Conocer proveedores</option>
                    <option value="Aprender nuevas tendencias">Aprender nuevas tendencias</option>
                    <option value="Buscar talento">Buscar talento</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.pregunta6 && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.pregunta6.message}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANTALLA 4: Cierre */}
        <div className={step === 4 ? 'block animate-fade-in' : 'hidden'}>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-blue-900 mb-2 border-b border-blue-100 pb-3">Resumen de tu registro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1">Nombre</p>
                  <p className="font-semibold text-gray-800">{getValues('nombre')}</p>
                </div>
                <div>
                  <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1">Correo</p>
                  <p className="font-semibold text-gray-800">{getValues('correo')}</p>
                </div>
                <div>
                  <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1">Ubicación</p>
                  <p className="font-semibold text-gray-800">{getValues('ciudad')}, {getValues('estado')}</p>
                </div>
                <div>
                  <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1">Acceso</p>
                  <p className="font-semibold text-gray-800">{getValues('tipoAcceso')} ({getValues('condicion')})</p>
                </div>
                {getValues('tipoAcceso') === 'Grupal' && (
                  <div>
                    <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1">Asistentes</p>
                    <p className="font-semibold text-gray-800">{getValues('numeroAsistentes')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4 pt-4 px-2">
              <input 
                type="checkbox" 
                id="privacidad"
                {...register('privacidad', { required: 'Debes aceptar la política de privacidad para continuar' })}
                className="mt-1 w-5 h-5 text-blue-900 focus:ring-blue-900 rounded border-gray-300 cursor-pointer shadow-sm"
              />
              <label htmlFor="privacidad" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                He leído y acepto la política de privacidad y consiento el tratamiento de mis datos personales para los fines del evento. *
              </label>
            </div>
            {errors.privacidad && <span className="text-red-500 text-sm block px-2 font-medium">{errors.privacidad.message}</span>}

            {status === 'success' && (
              <div className="p-5 rounded-xl bg-green-50 text-green-800 border border-green-200 text-center font-bold shadow-sm animate-fade-in flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>¡Registro completado con éxito! Gracias por unirte.</span>
              </div>
            )}
            {status === 'error' && (
              <div className="p-5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-center font-semibold shadow-sm animate-fade-in">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
          {step > 1 && status !== 'success' ? (
            <button 
              type="button" 
              onClick={prevStep}
              className="px-6 py-3 border-2 border-blue-100 text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors focus:ring-4 focus:ring-blue-900/10"
            >
              Anterior
            </button>
          ) : <div className="hidden sm:block"></div>}
          
          {step < 4 && (
            <button 
              type="button" 
              onClick={nextStep}
              className="w-full sm:w-auto px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/30 focus:ring-4 focus:ring-blue-900/30 ml-auto"
            >
              Continuar
            </button>
          )}
          
          {step === 4 && status !== 'success' && (
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full sm:w-auto px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/30 focus:ring-4 focus:ring-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ml-auto"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar mi registro</span>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

