import React, { useMemo } from "react";
import { WorkEntry, BrickType, Period, Multiplier } from "../types";
import { formatCurrency } from "../lib/utils";
import { Plus, TrendingUp, Calendar, Layers } from "lucide-react";

type Props = {
  entries: WorkEntry[];
  brickTypes: BrickType[];
  periods: Period[];
  multipliers: Multiplier[];
  onAddEntry: () => void;
  onEditEntry: (entry: WorkEntry) => void;
  onDeleteEntry: (id: string) => void;
};

export const Dashboard: React.FC<Props> = ({
  entries,
  brickTypes,
  periods,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today]
  );

  const currentPeriod = useMemo(() => {
    return periods.find((p) => {
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : new Date();
      const now = new Date();
      return now >= start && now <= end;
    });
  }, [periods]);

  const periodEntries = useMemo(() => {
    if (!currentPeriod) return entries;
    return entries.filter((e) => e.periodId === currentPeriod.id);
  }, [entries, currentPeriod]);

  const totalToday = todayEntries.reduce((s, e) => s + e.totalEarnings, 0);
  const totalPeriod = periodEntries.reduce((s, e) => s + e.totalEarnings, 0);
  const totalM2Period = periodEntries.reduce((s, e) => s + (e.squareMeters || 0), 0);

  const getBrickName = (id: string) =>
    brickTypes.find((b) => b.id === id)?.name || id;

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          {currentPeriod && (
            <p className="text-sm text-muted-foreground">Período: {currentPeriod.name}</p>
          )}
        </div>
        <button
          onClick={onAddEntry}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Añadir Registro
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Trabajo de Hoy</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalToday)}</p>
          <p className="text-sm text-muted-foreground">{todayEntries.length} registro(s)</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total ganancias:</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPeriod)}</p>
          <p className="text-sm text-muted-foreground">{periodEntries.length} registro(s)</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-sm">Total m²:</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalM2Period.toFixed(2)} m²</p>
          <p className="text-sm text-muted-foreground">en el período</p>
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Lista de trabajos recientes con acceso rápido</h2>
        {recentEntries.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>Añade tu primer registro</p>
            <button
              onClick={onAddEntry}
              className="mt-3 text-primary underline text-sm"
            >
              Añadir Registro
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{getBrickName(entry.brickTypeId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("es-ES")}
                    {entry.squareMeters ? ` · ${entry.squareMeters.toFixed(2)} m²` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{formatCurrency(entry.totalEarnings)}</span>
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-xs text-destructive hover:text-destructive/80 px-2 py-1 rounded hover:bg-destructive/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
