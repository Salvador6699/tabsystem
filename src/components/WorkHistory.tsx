import React, { useState, useMemo } from "react";
import { WorkEntry, BrickType, Period, Multiplier } from "../types";
import { formatCurrency } from "../lib/utils";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  entries: WorkEntry[];
  brickTypes: BrickType[];
  periods: Period[];
  multipliers: Multiplier[];
  onEditEntry: (entry: WorkEntry) => void;
  onDeleteEntry: (id: string) => void;
};

export const WorkHistory: React.FC<Props> = ({
  entries,
  brickTypes,
  periods,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [searchDate, setSearchDate] = useState("");

  const getBrickName = (id: string) =>
    brickTypes.find((b) => b.id === id)?.name || id;

  const getPeriodName = (id?: string) =>
    periods.find((p) => p.id === id)?.name || "Sin período";

  const filtered = useMemo(() => {
    let result = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (selectedPeriod !== "all") {
      result = result.filter((e) => e.periodId === selectedPeriod);
    }
    if (searchDate) {
      result = result.filter((e) => e.date.includes(searchDate));
    }
    return result;
  }, [entries, selectedPeriod, searchDate]);

  const totalEarnings = filtered.reduce((s, e) => s + e.totalEarnings, 0);
  const totalM2 = filtered.reduce((s, e) => s + (e.squareMeters || 0), 0);

  // Agrupar por fecha
  const groupedByDate = useMemo(() => {
    const groups: Record<string, WorkEntry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-foreground">Historial de Trabajo</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los períodos</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total ganancias:</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalEarnings)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total m²:</p>
          <p className="text-xl font-bold text-foreground">{totalM2.toFixed(2)} m²</p>
        </div>
      </div>

      {/* Lista agrupada por fecha */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay registros para mostrar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dayEntries]) => {
            const dayTotal = dayEntries.reduce((s, e) => s + e.totalEarnings, 0);
            return (
              <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-accent/30 border-b border-border">
                  <span className="font-semibold text-sm text-foreground">
                    {new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-bold text-sm">{formatCurrency(dayTotal)}</span>
                </div>
                <div className="divide-y divide-border">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {getBrickName(entry.brickTypeId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.squareMeters
                            ? `${entry.squareMeters.toFixed(2)} m²`
                            : entry.quantity
                            ? `${entry.quantity} uds`
                            : ""}
                          {entry.periodId ? ` · ${getPeriodName(entry.periodId)}` : ""}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(entry.totalEarnings)}</p>
                          {entry.supplementEarnings > 0 && (
                            <p className="text-xs text-muted-foreground">
                              base: {formatCurrency(entry.baseEarnings)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("¿Eliminar este registro?")) onDeleteEntry(entry.id);
                            }}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
