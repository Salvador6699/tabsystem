import React from "react";
import { X, BookOpen } from "lucide-react";

type Props = { onClose: () => void };

export const UserGuide: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Guía de Usuario - TabSystem
        </h1>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 text-sm text-foreground">
        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Primeros Pasos</h2>
          <p className="text-muted-foreground">
            Configura tu entorno de trabajo desde{" "}
            <strong>Menú → Configuración</strong>. Ahí puedes añadir tus tipos
            de ladrillo, períodos de trabajo y multiplicadores de dificultad.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Añadir Registros</h2>
          <p className="text-muted-foreground">
            Usa el botón <strong>Añadir Registro</strong> (o el botón flotante{" "}
            <strong>Acceso rápido: Botón flotante</strong>) para registrar el
            trabajo diario. Introduce metros lineales y altura para calcular m²
            automáticamente.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <strong>Ladrillos Regulares:</strong> se calcula por m²
            </li>
            <li>
              <strong>Trabajos por Cantidad:</strong> se calcula por número de
              unidades
            </li>
            <li>
              <strong>Multiplicadores:</strong> aplica factores de dificultad
              (trabajo nocturno, etc.)
            </li>
          </ul>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Períodos de Trabajo</h2>
          <p className="text-muted-foreground">
            Los períodos agrupan los registros por etapas (semanas, meses, obras...).
            Ve a <strong>Configuración → Gestión de Períodos</strong> para
            crearlos. Asigna cada registro a un período.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Mediciones Globales</h2>
          <p className="text-muted-foreground">
            Crea mediciones globales del trabajo total realizado en un período
            para <strong>comparar con los registros diarios</strong> y detectar
            diferencias o errores. Útil para generar informes finales para
            facturación.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Almacenamiento y Sincronización</h2>
          <p className="text-muted-foreground">
            Por defecto los datos se guardan en el navegador (localStorage).
            Puedes exportar como respaldo desde{" "}
            <strong>Configuración → Exportar y Compartir Datos</strong>.
          </p>
          <p className="text-muted-foreground">
            <strong>Mejores Prácticas:</strong> Exporta regularmente como respaldo.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-base">Interpretación de Resultados</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              Diferencias <strong className="text-green-500">positivas</strong>:
              trabajos no registrados
            </li>
            <li>
              Diferencias <strong className="text-red-500">negativas</strong>:
              posibles errores de medición
            </li>
          </ul>
        </section>
      </div>

      <button
        onClick={onClose}
        className="w-full border border-border rounded-lg py-2 text-foreground hover:bg-accent transition-colors"
      >
        Cerrar Guía
      </button>
    </div>
  );
};
