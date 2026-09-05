"use client";

import React from 'react';
import { useForm } from 'react-hook-form';

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
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log("Datos del formulario enviados:", data);
    // TODO: Connect to Supabase here
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

        <button
          type="submit"
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-900/30"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
