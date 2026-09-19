"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { validarSocio } from '../app/actions/validarSocio';
import Paso3RetosYObjetivos, { Paso3Data } from './Paso3RetosYObjetivos';

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
  numeroSocio: string;
  numeroAsistentes: number;
  motivosAsistencia: string[];
  retosActuales: string[];
  retoUrgente: string;
  tiempoAccion: string;
  privacidad: boolean;
  recibir_info: boolean;
  motivaciones_otro?: string;
  retos_otro?: string;
  expectativa?: string;
  expectativa_otro?: string;
  pregunta_especialistas?: string;
  tipo_actividad?: string[];
};

export default function FormularioRegistro() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validandoSocio, setValidandoSocio] = useState(false);
  const [resultadoValidacionSocio, setResultadoValidacionSocio] = useState<{ status: string, existe: boolean, mensaje: string } | null>(null);

  const { register, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      motivosAsistencia: [],
      retosActuales: [],
      tipoAcceso: 'Individual',
      condicion: 'No socio',
      privacidad: false,
      recibir_info: false
    }
  });

  const watchSituacion = watch('situacionActual');
  const watchTipoAcceso = watch('tipoAcceso');
  const watchNumeroSocio = watch('numeroSocio');
  const watchExpectativa = watch('expectativa');
  const watchTipoActividad = watch('tipo_actividad') || [];
  
  const handleValidarSocio = async () => {
    const num = getValues('numeroSocio');
    if (!num) return;
    setValidandoSocio(true);
    setResultadoValidacionSocio(null);
    try {
      const res = await validarSocio(num);
      setResultadoValidacionSocio(res);
    } catch (e) {
      setResultadoValidacionSocio({ status: 'error', existe: false, mensaje: 'Error al validar' });
    } finally {
      setValidandoSocio(false);
    }
  };

  const handlePaso3Submit = (data: Paso3Data) => {
    setValue('motivosAsistencia', data.motivosAsistencia);
    setValue('retosActuales', data.retosActuales);
    setValue('retoUrgente', data.retoUrgente);
    setValue('tiempoAccion', data.tiempoAccion);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (watchTipoAcceso === 'Individual') {
      setValue('numeroAsistentes', 1);
    } else if (watchTipoAcceso === 'Grupal' && getValues('numeroAsistentes') === 1) {
      setValue('numeroAsistentes', 5);
    }
  }, [watchTipoAcceso, setValue, getValues]);

  const nextStep = async () => {
    let fieldsToValidate: any = [];
    if (step === 1) {
      fieldsToValidate = ['nombre', 'correo', 'ciudad', 'estado', 'situacionActual', 'empresa', 'cargo'];
      if (watchSituacion === 'Otra') fieldsToValidate.push('situacionOtra');
    } else if (step === 2) {
      fieldsToValidate = ['tipoAcceso', 'condicion', 'numeroAsistentes'];
      if (watch('condicion') === 'Socio') fieldsToValidate.push('numeroSocio');
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
        numero_socio: sanitizeText(data.numeroSocio) || null,
        numero_asistentes: data.numeroAsistentes || null,
        retosActuales: (data.retosActuales || []).map(r => r === 'Otro' && data.retos_otro ? sanitizeText(data.retos_otro) as string : sanitizeText(r) as string),
        retoUrgente: sanitizeText(data.retoUrgente) || null,
        tiempoAccion: sanitizeText(data.tiempoAccion) || null,
        recibir_info: data.recibir_info,
        motivosAsistencia: (data.motivosAsistencia || []).map(m => m === 'Otra razón' && data.motivaciones_otro ? sanitizeText(data.motivaciones_otro) as string : sanitizeText(m) as string),
        expectativaAsistencia: sanitizeText(data.expectativa === 'Otro' ? data.expectativa_otro : data.expectativa) || null,
        preguntaEspecialista: sanitizeText(data.pregunta_especialistas) || null,
        actividadesUtiles: (data.tipo_actividad || []).map(t => sanitizeText(t) as string)
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
      {status === 'success' ? (
        <div className="py-12 animate-fade-in text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">¡Tu registro quedó listo!</h3>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Gracias por compartir lo que buscas. Tus respuestas nos ayudarán a orientar a los contenidos y las conversaciones del foro de comercio.
          </p>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl max-w-md mx-auto text-sm text-blue-800 shadow-sm">
            <p className="font-semibold mb-2 flex justify-center items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Detalles del evento
            </p>
            <p className="opacity-90">[Fecha del evento] | [Lugar o enlace] | [Horario]</p>
            <p className="text-xs mt-3 opacity-75">(Datos definitivos pendientes por el área organizadora)</p>
          </div>
        </div>
      ) : (
        <>
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
        {step === 4 && "Expectativas y Confirmación"}
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
              <label className="mb-2 text-sm font-semibold text-gray-700">Empresa *</label>
              <input {...register('empresa', { required: 'Obligatorio' })} className={inputClass('empresa')} placeholder="Nombre de tu empresa" />
              {errors.empresa && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.empresa.message}</span>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Cargo *</label>
              <input {...register('cargo', { required: 'Obligatorio' })} className={inputClass('cargo')} placeholder="Tu cargo" />
              {errors.cargo && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.cargo.message}</span>}
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
                <option value="Tengo un negocio o empresa">Tengo un negocio o empresa</option>
                <option value="Trabajo en una empresa">Trabajo en una empresa</option>
                <option value="Estoy por emprender">Estoy por emprender</option>
                <option value="Represento a una institucion, camara u organismo">Represento a una institucion, camara u organismo</option>
                <option value="Soy estudiante o docente">Soy estudiante o docente</option>
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

            {watch('condicion') === 'Socio' && (
              <div className="flex flex-col pt-2 animate-fade-in">
                <label className="mb-2 text-sm font-semibold text-gray-700">Número de socio *</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    {...register('numeroSocio', { required: 'El número de socio es obligatorio' })} 
                    className={inputClass('numeroSocio') + (resultadoValidacionSocio?.existe ? ' bg-gray-100 opacity-70 cursor-not-allowed' : '')} 
                    placeholder="Ingresa tu número de socio"
                    readOnly={resultadoValidacionSocio?.existe}
                  />
                  <button
                    type="button"
                    onClick={handleValidarSocio}
                    disabled={validandoSocio || resultadoValidacionSocio?.existe || !watchNumeroSocio}
                    className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-md hover:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center min-w-[100px]"
                  >
                    {validandoSocio ? (
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Validar'}
                  </button>
                </div>
                {errors.numeroSocio && !resultadoValidacionSocio && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.numeroSocio.message}</span>}
                {resultadoValidacionSocio && (
                  <span className={`text-sm mt-1.5 font-medium ${resultadoValidacionSocio.existe ? 'text-green-600' : 'text-red-500'}`}>
                    {resultadoValidacionSocio.mensaje}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col pt-2">
              <label className="mb-2 text-sm font-semibold text-gray-700">Número de asistentes *</label>
              <input 
                type="number" 
                {...register('numeroAsistentes', { 
                  required: 'Obligatorio', 
                  validate: {
                    minGroup: (v) => {
                      if (watchTipoAcceso === 'Grupal') {
                        if (v >= 2 && v <= 4) {
                          return 'Para 2 a 4 personas, indicar que deben realizar registros individuales, no aplicar tarifa grupal';
                        }
                        if (v < 5) {
                          return 'El mínimo para tarifa grupal es 5 asistentes';
                        }
                      }
                      return true;
                    },
                    isInteger: (v) => Number.isInteger(v) || 'Debe ser un número entero'
                  },
                  valueAsNumber: true
                })} 
                className={inputClass('numeroAsistentes') + (watchTipoAcceso === 'Individual' ? ' bg-gray-100 opacity-70 cursor-not-allowed' : '')} 
                placeholder="Ej. 5"
                readOnly={watchTipoAcceso === 'Individual'}
              />
              {errors.numeroAsistentes && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.numeroAsistentes.message}</span>}
            </div>

            {/* Tarjeta Resumen Temporal */}
            <div className="mt-8 bg-blue-50/80 p-5 rounded-2xl border border-blue-100 shadow-sm animate-fade-in">
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Resumen de Tarifas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 mb-4">
                <div>
                  <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Modalidad</span>
                  <span className="font-bold">{watchTipoAcceso || 'No definida'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Condición Validada</span>
                  <span className="font-bold">{watch('condicion') || 'No definida'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Cantidad de Asistentes</span>
                  <span className="font-bold">{watch('numeroAsistentes') || 0}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-50 text-center shadow-sm">
                <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Total a Pagar</span>
                <span className="text-xl md:text-2xl font-black text-blue-900 block mb-1">$0.00 MXN</span>
                <span className="text-xs text-blue-600/80 font-medium">(Tarifas y políticas de validación pendientes de configuración)</span>
              </div>
            </div>

          </div>
        </div>

        {/* PANTALLA 3: Retos */}
        <div className={step === 3 ? 'block animate-fade-in' : 'hidden'}>
          <Paso3RetosYObjetivos 
            initialData={{
              motivosAsistencia: getValues('motivosAsistencia') || [],
              retosActuales: getValues('retosActuales') || [],
              retoUrgente: getValues('retoUrgente') || '',
              tiempoAccion: getValues('tiempoAccion') || ''
            }}
            onSubmit={handlePaso3Submit} 
            onBack={prevStep} 
          />
        </div>

        {/* PANTALLA 4: Cierre */}
        <div className={step === 4 ? 'block animate-fade-in' : 'hidden'}>
          <div className="space-y-10">

            {/* Q5: Expectativas */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-base font-semibold text-gray-800">5. ¿Qué tendría que pasar para que sintieras que valió la pena asistir? *</label>
                <p className="text-sm text-gray-500 mt-1">Selecciona el resultado más importante para ti</p>
              </div>
              <div className="space-y-3">
                {[
                  'Salir con pasos concretos para resolver un problema',
                  'Aprender una herramienta útil para mi actividad',
                  'Conocer un posible cliente',
                  'Encontrar un proveedor, socio o aliado',
                  'Identificar una oportunidad o un apoyo para mi negocio',
                  'Tener más claridad para tomar una decisión',
                  'Otro'
                ].map(opcion => (
                  <label key={opcion} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${watchExpectativa === opcion ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      value={opcion} 
                      {...register('expectativa', { required: 'Obligatorio' })} 
                      className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" 
                    />
                    <span className="ml-3 font-medium text-gray-800">{opcion}</span>
                  </label>
                ))}
              </div>
              {errors.expectativa && <span className="text-red-500 text-sm font-medium">{errors.expectativa.message}</span>}
              {watchExpectativa === 'Otro' && (
                <div className="mt-2 animate-fade-in">
                  <input 
                    type="text" 
                    {...register('expectativa_otro', { required: 'Por favor, especifica' })} 
                    placeholder="Escribe tu expectativa..."
                    className={inputClass('expectativa_otro')} 
                  />
                  {errors.expectativa_otro && <span className="text-red-500 text-sm mt-1.5 font-medium">{errors.expectativa_otro.message}</span>}
                </div>
              )}
            </div>

            {/* Q6: Pregunta a especialistas */}
            <div className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
              <label className="text-base font-semibold text-gray-800">6. Si pudieras hacer una sola pregunta a los especialistas del foro, ¿Cuál sería? (Opcional)</label>
              <div className="relative">
                <textarea 
                  {...register('pregunta_especialistas', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })} 
                  className={`w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none text-gray-900 ${errors.pregunta_especialistas ? 'border-red-300' : 'border-gray-300'}`}
                  rows={4}
                  maxLength={500}
                  placeholder="Escribe tu pregunta aquí..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {(watch('pregunta_especialistas') || '').length} / 500
                </div>
              </div>
              {errors.pregunta_especialistas && <span className="text-red-500 text-sm font-medium">{errors.pregunta_especialistas.message}</span>}
            </div>

            {/* Q7: Tipo de actividad */}
            <div className="flex flex-col space-y-4 pt-6 border-t border-gray-100 pb-6 border-b">
              <label className="text-base font-semibold text-gray-800">7. ¿Qué tipo de actividad te sería más útil? (Opcional, máximo 2)</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Talleres prácticos',
                  'Casos reales de otros negocios',
                  'Charlas breves con recomendaciones concretas',
                  'Mesas para conversar con especialistas',
                  'Encuentros para conectar con clientes, proveedores o aliados'
                ].map(opcion => {
                  const isChecked = watchTipoActividad.includes(opcion);
                  const isDisabled = !isChecked && watchTipoActividad.length >= 2;
                  
                  return (
                    <label key={opcion} className={`flex items-center p-3 border rounded-xl transition-colors ${isChecked ? 'border-blue-600 bg-blue-50' : 'border-gray-200'} ${isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'cursor-pointer hover:border-blue-300'}`}>
                      <input 
                        type="checkbox" 
                        value={opcion} 
                        {...register('tipo_actividad', {
                          validate: v => {
                            if (v && v.length > 2) return 'Máximo 2 opciones permitidas';
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
              {errors.tipo_actividad && <span className="text-red-500 text-sm font-medium">{errors.tipo_actividad.message}</span>}
            </div>

            {/* Resumen */}
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

            <div className="flex flex-col space-y-3 pt-4 px-2">
              <div className="flex items-start space-x-4">
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
              {errors.privacidad && <span className="text-red-500 text-sm block px-9 font-medium">{errors.privacidad.message}</span>}
              
              <div className="flex items-start space-x-4 mt-2">
                <input 
                  type="checkbox" 
                  id="recibir_info"
                  {...register('recibir_info')}
                  className="mt-1 w-5 h-5 text-blue-900 focus:ring-blue-900 rounded border-gray-300 cursor-pointer shadow-sm"
                />
                <label htmlFor="recibir_info" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  Quiero recibir información sobre próximos eventos y oportunidades.
                </label>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-center font-semibold shadow-sm animate-fade-in">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Controles de navegación */}
        {step !== 3 && (
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
            {step > 1 ? (
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
            
            {step === 4 && (
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
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Confirmar mi registro</span>
                )}
              </button>
            )}
          </div>
        )}
        </form>
      </>
      )}
    </div>
  );
}

