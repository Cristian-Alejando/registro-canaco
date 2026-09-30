import React, { useState, useEffect } from 'react';

export interface Paso3Data {
  motivosAsistencia: string[];
  retosActuales: string[];
  retoUrgente: string;
}

interface Paso3Props {
  initialData?: Paso3Data;
  onSubmit: (data: Paso3Data) => void;
  onBack?: () => void;
}

const MOTIVOS_OPCIONES = [
  "Encontrar soluciones a un problema de mi negocio",
  "Aprender herramientas que pueda poner en práctica",
  "Conocer posibles clientes o generar ventas",
  "Encontrar proveedores, socios o aliados",
  "Identificar nuevas oportunidades de negocio",
  "Entender tendencias y cambios en el comercio",
  "Conocer apoyos o programas para mi negocio",
  "Explorar el sector antes de emprender",
  "Otra razón"
];

const RETOS_OPCIONES = [
  "Conseguir nuevos clientes",
  "Lograr que mis clientes regresen",
  "Vender por internet o aprovechar redes sociales",
  "Controlar costos y mantener ganancias",
  "Conseguir financiamiento o tener dinero disponible para operar",
  "Encontrar proveedores de confianza y competitivos",
  "Mejorar inventarios, entregas o logística",
  "Entender y cumplir trámites y requisitos",
  "Contratar, capacitar o retener personal",
  "Diferenciarme de la competencia",
  "No tener claro cómo iniciar o hacer crecer un negocio",
  "Por ahora no enfrento un reto específico; busco aprender y explorar",
  "Otro"
];

const OPCION_EXCLUSIVA = "Por ahora no enfrento un reto específico; busco aprender y explorar";

export default function Paso3RetosYObjetivos({ initialData, onSubmit, onBack }: Paso3Props) {
  const [motivos, setMotivos] = useState<string[]>(initialData?.motivosAsistencia || []);
  const [retos, setRetos] = useState<string[]>(initialData?.retosActuales || []);
  const [retoUrgente, setRetoUrgente] = useState<string>(initialData?.retoUrgente || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const esOpcionExclusivaSeleccionada = retos.includes(OPCION_EXCLUSIVA);

  // Efecto para sincronizar Pregunta 3 con las opciones de Pregunta 2
  useEffect(() => {
    if (esOpcionExclusivaSeleccionada) {
      setRetoUrgente('');
      return;
    }

    if (retos.length === 1) {
      setRetoUrgente(retos[0]);
    } else if (retos.length > 1) {
      if (!retos.includes(retoUrgente)) {
        setRetoUrgente('');
      }
    } else {
      setRetoUrgente('');
    }
  }, [retos, esOpcionExclusivaSeleccionada]);

  // Manejador para Pregunta 1
  const handleMotivoChange = (opcion: string) => {
    setMotivos((prev) => {
      if (prev.includes(opcion)) {
        return prev.filter((item) => item !== opcion);
      } else {
        if (prev.length >= 2) return prev; // Bloquear si ya hay 2
        return [...prev, opcion];
      }
    });
    // Limpiar error al interactuar
    if (errors.motivos) setErrors((prev) => ({ ...prev, motivos: '' }));
  };

  // Manejador para Pregunta 2
  const handleRetoChange = (opcion: string) => {
    setRetos((prev) => {
      // Si hace clic en la exclusiva
      if (opcion === OPCION_EXCLUSIVA) {
        if (prev.includes(OPCION_EXCLUSIVA)) {
          return []; // Desmarcar exclusiva
        } else {
          // Marcar exclusiva y limpiar todo lo demás
          return [OPCION_EXCLUSIVA];
        }
      }

      // Si hace clic en cualquier otra opción
      if (prev.includes(opcion)) {
        return prev.filter((item) => item !== opcion);
      } else {
        if (prev.length >= 3) return prev; // Bloquear si ya hay 3
        // Remover exclusiva si estuviera marcada (por seguridad, aunque el UI la deshabilita)
        const sinExclusiva = prev.filter(item => item !== OPCION_EXCLUSIVA);
        return [...sinExclusiva, opcion];
      }
    });
    // Limpiar error al interactuar
    if (errors.retos) setErrors((prev) => ({ ...prev, retos: '' }));
  };

  // Validación y Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (motivos.length < 1) {
      newErrors.motivos = "Selecciona al menos 1 opción.";
    }
    if (retos.length < 1) {
      newErrors.retos = "Selecciona al menos 1 opción.";
    }

    if (!esOpcionExclusivaSeleccionada) {
      if (!retoUrgente.trim()) {
        newErrors.retoUrgente = "Este campo es obligatorio.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      motivosAsistencia: motivos,
      retosActuales: retos,
      retoUrgente: esOpcionExclusivaSeleccionada ? "Estoy explorando" : retoUrgente,
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="text-gray-500 mt-2 text-sm">Ayúdanos a entender mejor lo que buscas para ofrecerte la mejor experiencia.</p>
      </div>

      <div className="space-y-10">

        {/* Pregunta 1 */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foro-blue">1. ¿Qué te mueve principalmente a asistir al foro? *</h3>
            <p className="text-sm text-gray-500">Selecciona entre 1 y 2 opciones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOTIVOS_OPCIONES.map((opcion) => {
              const isChecked = motivos.includes(opcion);
              const isDisabled = !isChecked && motivos.length >= 2;

              return (
                <label
                  key={opcion}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${isChecked ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleMotivoChange(opcion)}
                  />
                  <span className="ml-3 text-sm text-gray-700 leading-snug">{opcion}</span>
                </label>
              );
            })}
          </div>
          {errors.motivos && <p className="text-red-500 text-sm">{errors.motivos}</p>}
        </div>

        {/* Pregunta 2 */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foro-blue">2. ¿Qué retos te están frenando más en este momento? *</h3>
            <p className="text-sm text-gray-500">Selecciona entre 1 y 3 opciones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RETOS_OPCIONES.map((opcion) => {
              const isChecked = retos.includes(opcion);
              const isExclusiva = opcion === OPCION_EXCLUSIVA;

              // Deshabilitar si no está chequeada y ya hay 3 seleccionadas
              // O si la opción exclusiva está seleccionada y esta no es la exclusiva
              let isDisabled = false;
              if (!isChecked && retos.length >= 3) isDisabled = true;
              if (esOpcionExclusivaSeleccionada && !isExclusiva) isDisabled = true;

              return (
                <label
                  key={opcion}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${isChecked ? 'bg-indigo-50 border-indigo-500' : 'border-gray-200 hover:bg-gray-50'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''}
                    ${isExclusiva ? 'md:col-span-2 bg-slate-50' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleRetoChange(opcion)}
                  />
                  <span className={`ml-3 text-sm text-gray-700 leading-snug ${isExclusiva ? 'font-medium text-slate-700' : ''}`}>
                    {opcion}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.retos && <p className="text-red-500 text-sm">{errors.retos}</p>}
        </div>

        {/* Pregunta 3 (Condicional) */}
        {!esOpcionExclusivaSeleccionada && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">

            {/* Pregunta 3 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foro-blue">3. De esos retos, ¿Cuál te urge más resolver? *</h3>
                <p className="text-sm text-gray-500">Selecciona el más prioritario.</p>
              </div>

              <div className="space-y-3">
                {retos.length === 0 && (
                   <p className="text-sm text-gray-500 italic">Selecciona tus retos en la pregunta anterior para continuar.</p>
                )}
                {retos.map((reto) => (
                  <label
                    key={reto}
                    className={`flex items-center p-3 rounded-lg border transition-colors
                      ${retoUrgente === reto ? 'bg-blue-50 border-blue-600' : 'border-gray-200 hover:bg-gray-50'}
                      ${retos.length === 1 ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                    `}
                  >
                    <input
                      type="radio"
                      name="retoUrgente"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={retoUrgente === reto}
                      disabled={retos.length === 1}
                      onChange={() => {
                        if (retos.length > 1) {
                          setRetoUrgente(reto);
                          if (errors.retoUrgente) setErrors(prev => ({ ...prev, retoUrgente: '' }));
                        }
                      }}
                    />
                    <span className="ml-3 text-sm text-gray-700">{reto}</span>
                  </label>
                ))}
              </div>
              {errors.retoUrgente && <p className="text-red-500 text-sm mt-1">{errors.retoUrgente}</p>}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Atrás
            </button>
          ) : (
            <div /> // Espaciador
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-medium text-white bg-foro-orange border border-transparent rounded-lg hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
