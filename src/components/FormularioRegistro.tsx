"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type FieldConfig = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
};

const formFields: FieldConfig[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Tu nombre', required: true },
  { name: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Tus apellidos', required: true },
  { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: 'Tu teléfono', required: true },
];

export default function FormularioRegistro() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data: any) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const { error } = await supabase
        .from('registros_evento')
        .insert([data]);

      if (error) throw error;

      setStatus('success');
      reset(); // Limpia el formulario
    } catch (error: any) {
      console.error("Error al registrar:", error);
      setStatus('error');
      setErrorMessage(error.message || 'Ocurrió un error inesperado al registrar.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6 text-center">Completa tus datos</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formFields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="mb-2 text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name, { required: field.required ? `El campo ${field.label.toLowerCase()} es obligatorio` : false })}
              className={`px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-gray-900 ${
                errors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}
            />
            {errors[field.name] && (
              <span className="mt-1 text-sm text-red-500">
                {errors[field.name]?.message as string}
              </span>
            )}
          </div>
        ))}

        {status === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 text-center font-medium">
            ¡Registro completado con éxito!
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-center font-medium">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}
