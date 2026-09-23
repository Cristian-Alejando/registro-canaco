import React, { useState, useEffect } from 'react';

export interface Paso3Data {
  motivosAsistencia: string[];
  retosActuales: string[];
  retoUrgente: string;
  tiempoAccion: string;
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

const TIEMPO_OPCIONES = [
  "Ya estoy buscando una solución",
  "En los próximos 3 meses",
  "Entre 3 y 6 meses",
  "Más adelante; por ahora quiero informarme",
  "No aplica a mi situación actual"
];

export default function Paso3RetosYObjetivos({ initialData, onSubmit, onBack }: Paso3Props) {
  const [motivos, setMotivos] = useState<string[]>(initialData?.motivosAsistencia || []);
  const [retos, setRetos] = useState<string[]>(initialData?.retosActuales || []);
  const [retoUrgente, setRetoUrgente] = useState<string>(initialData?.retoUrgente || "");
  const [tiempoAccion, setTiempoAccion] = useState<string>(initialData?.tiempoAccion || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const esOpcionExclusivaSeleccionada = retos.includes(OPCION_EXCLUSIVA);

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
          setRetoUrgente("Estoy explorando");
          setTiempoAccion("No aplica");
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
      if (!tiempoAccion) {
        newErrors.tiempoAccion = "Selecciona una opción.";
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
      tiempoAccion: esOpcionExclusivaSeleccionada ? "No aplica" : tiempoAccion,
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

        {/* Preguntas 3 y 4 (Condicionales) */}
        {!esOpcionExclusivaSeleccionada && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            
            {/* Pregunta 3 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foro-blue">3. De esos retos, ¿Cuál te urge más resolver? *</h3>
                {retos.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-800 font-medium mb-1">Tus retos seleccionados:</p>
                    <ul className="list-disc list-inside text-sm text-amber-900">
                      {retos.map((reto, idx) => (
                        <li key={idx} className="truncate">{reto}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900
                    ${errors.retoUrgente ? 'border-red-300' : 'border-gray-300'}
                  `}
                  rows={4}
                  maxLength={200}
                  placeholder="Escribe brevemente tu mayor urgencia..."
                  value={retoUrgente}
                  onChange={(e) => {
                    setRetoUrgente(e.target.value);
                    if (errors.retoUrgente) setErrors(prev => ({ ...prev, retoUrgente: '' }));
                  }}
                />
                <div className={`absolute bottom-3 right-3 text-xs ${retoUrgente.length === 200 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {retoUrgente.length} / 200
                </div>
              </div>
              {errors.retoUrgente && <p className="text-red-500 text-sm mt-1">{errors.retoUrgente}</p>}
            </div>

            {/* Pregunta 4 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foro-blue">4. ¿Cuándo te gustaría tomar acciones para resolverlo? *</h3>
              </div>
              
              <div className="space-y-3">
                {TIEMPO_OPCIONES.map((opcion) => (
                  <label 
                    key={opcion} 
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                      ${tiempoAccion === opcion ? 'bg-blue-50 border-blue-600' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="tiempoAccion"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={tiempoAccion === opcion}
                      onChange={() => {
                        setTiempoAccion(opcion);
                        if (errors.tiempoAccion) setErrors(prev => ({ ...prev, tiempoAccion: '' }));
                      }}
                    />
                    <span className="ml-3 text-sm text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
              {errors.tiempoAccion && <p className="text-red-500 text-sm">{errors.tiempoAccion}</p>}
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
