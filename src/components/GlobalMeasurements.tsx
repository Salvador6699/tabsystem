import React, { useState } from "react";
import { GlobalMeasurement, BrickType, Period, WorkEntry, Multiplier } from "../types";
import { generateId, formatCurrency } from "../lib/utils";
import { Plus, Trash2, Pencil, BarChart2 } from "lucide-react";

type Props = {
  globalMeasurements: GlobalMeasurement[];
  setGlobalMeasurements: (v: GlobalMeasurement[] | ((p: GlobalMeasurement[]) => GlobalMeasurement[])) => void;
  workEntries: WorkEntry[];
  brickTypes: BrickType[];
  periods: Period[];
  multipliers: Multiplier[];
};

export const GlobalMeasurements: React.FC<Props> = ({
  globalMeasurements,
  setGlobalMeasurements,
  workEntries,
  brickTypes,
  periods,
}) => {
  const [view, setView] = useState<"list" | "add" | "edit" | "compare">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [comparePeriodId, setComparePeriodId] = useState("");

  // Form state
  const [formPeriodId, setFormPeriodId] = useState("");
  const [formRecords, setFormRecords] = useState<{ brickTypeId: string; squareMeters: string }[]>(
    [{ brickTypeId: brickTypes[0]?.id || "", squareMeters: "" }]
  );
  const [formDescription, setFormDescription] = useState("");

  const getPeriodName = (id: string) => periods.find((p) => p.id === id)?.name || id;
  const getBrickName = (id: string) => brickTypes.find((b) => b.id === id)?.name || id;

  const calcTotals = (m: GlobalMeasurement) => {
    const totalM2 = m.records.reduce((s, r) => s + r.squareMeters, 0);
    const totalEarnings = m.records.reduce((s, r) => {
      const brick = brickTypes.find((b) => b.id === r.brickTypeId);
      return s + (brick ? r.squareMeters * brick.pricePerSquareMeter : 0);
    }, 0);
    return { totalM2, totalEarnings };
  };

  const addRecord = () =>
    setFormRecords((prev) => [...prev, { brickTypeId: brickTypes[0]?.id || "", squareMeters: "" }]);

  const saveForm = () => {
    if (!formPeriodId) return;
    const records = formRecords
      .filter((r) => r.brickTypeId && parseFloat(r.squareMeters) > 0)
      .map((r) => {
        const brick = brickTypes.find((b) => b.id === r.brickTypeId);
        const m2 = parseFloat(r.squareMeters);
        return {
          brickTypeId: r.brickTypeId,
          squareMeters: m2,
          earnings: brick ? m2 * brick.pricePerSquareMeter : 0,
        };
      });

    if (records.length === 0) { alert("Añade al menos un registro válido"); return; }

    const measurement: GlobalMeasurement = {
      id: editingId || generateId(),
      periodId: formPeriodId,
      records,
      description: formDescription || undefined,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      setGlobalMeasurements((prev) => prev.map((m) => (m.id === editingId ? measurement : m)));
    } else {
      setGlobalMeasurements((prev) => [...prev, measurement]);
    }

    setView("list");
    setEditingId(null);
    setFormPeriodId("");
    setFormRecords([{ brickTypeId: brickTypes[0]?.id || "", squareMeters: "" }]);
    setFormDescription("");
  };

  const startEdit = (m: GlobalMeasurement) => {
    setEditingId(m.id);
    setFormPeriodId(m.periodId);
    setFormRecords(m.records.map((r) => ({ brickTypeId: r.brickTypeId, squareMeters: r.squareMeters.toString() })));
    setFormDescription(m.description || "");
    setView("edit");
  };

  // Comparación con registros diarios
  const getComparison = (periodId: string) => {
    const globalForPeriod = globalMeasurements.find((m) => m.periodId === periodId);
    if (!globalForPeriod) return null;

    const dailyEntries = workEntries.filter((e) => e.periodId === periodId);
    const dailyM2 = dailyEntries.reduce((s, e) => s + (e.squareMeters || 0), 0);
    const dailyEarnings = dailyEntries.reduce((s, e) => s + e.totalEarnings, 0);
    const { totalM2: globalM2, totalEarnings: globalEarnings } = calcTotals(globalForPeriod);

    return {
      globalM2,
      globalEarnings,
      dailyM2,
      dailyEarnings,
      diffM2: globalM2 - dailyM2,
      diffEarnings: globalEarnings - dailyEarnings,
    };
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {view === "edit" ? "Editar Medición Global" : "Nueva Medición"}
        </h1>
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Período *</label>
            <select
              value={formPeriodId}
              onChange={(e) => setFormPeriodId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un período</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Añadir registros detallados por tipo de material</p>
            {formRecords.map((rec, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <select
                  value={rec.brickTypeId}
                  onChange={(e) => {
                    const updated = [...formRecords];
                    updated[idx].brickTypeId = e.target.value;
                    setFormRecords(updated);
                  }}
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
                >
                  {brickTypes.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={rec.squareMeters}
                  onChange={(e) => {
                    const updated = [...formRecords];
                    updated[idx].squareMeters = e.target.value;
                    setFormRecords(updated);
                  }}
                  placeholder="m²"
                  className="w-28 border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
                />
                {formRecords.length > 1 && (
                  <button
                    onClick={() => setFormRecords((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRecord}
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" /> Añadir línea
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción opcional de la medición</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setView("list"); setEditingId(null); }}
              className="flex-1 border border-border rounded-lg py-2 text-sm hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              onClick={saveForm}
              className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm hover:bg-primary/90 font-medium"
            >
              {view === "edit" ? "Guardar Medición" : "Guardar Medición Global"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "compare") {
    const comp = getComparison(comparePeriodId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h1 className="text-2xl font-bold">Comparación de Informes - {getPeriodName(comparePeriodId)}</h1>
        </div>
        {!comp ? (
          <p className="text-muted-foreground">No hay medición global para este período.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Medición Global</p>
                <p className="text-xl font-bold">{comp.globalM2.toFixed(2)} m²</p>
                <p className="text-sm">{formatCurrency(comp.globalEarnings)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Registros Diarios</p>
                <p className="text-xl font-bold">{comp.dailyM2.toFixed(2)} m²</p>
                <p className="text-sm">{formatCurrency(comp.dailyEarnings)}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold mb-2">Diferencias Totales</p>
              <p className={`text-lg font-bold ${comp.diffM2 > 0 ? "text-green-500" : comp.diffM2 < 0 ? "text-red-500" : ""}`}>
                {comp.diffM2 > 0 ? "+" : ""}{comp.diffM2.toFixed(2)} m²
              </p>
              <p className={`text-sm ${comp.diffEarnings > 0 ? "text-green-500" : comp.diffEarnings < 0 ? "text-red-500" : ""}`}>
                {comp.diffEarnings > 0 ? "+" : ""}{formatCurrency(comp.diffEarnings)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {comp.diffM2 > 0
                  ? "Detectar trabajos no registrados (diferencias positivas)"
                  : "Identificar errores de medición (diferencias negativas)"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Mediciones Globales</h1>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Nueva Medición
        </button>
      </div>

      {/* Comparar */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Comparar Informes
        </h3>
        <div className="flex gap-3 flex-wrap">
          <select
            value={comparePeriodId}
            onChange={(e) => setComparePeriodId(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
          >
            <option value="">Selecciona un período</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => { if (comparePeriodId) setView("compare"); }}
            disabled={!comparePeriodId}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            Comparar Informes
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Mediciones Registradas</h3>
        </div>
        {globalMeasurements.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">
            No hay mediciones globales registradas
          </p>
        ) : (
          <div className="divide-y divide-border">
            {globalMeasurements.map((m) => {
              const { totalM2, totalEarnings } = calcTotals(m);
              return (
                <div key={m.id} className="flex items-center justify-between px-4 py-4 gap-4">
                  <div>
                    <p className="font-semibold">{getPeriodName(m.periodId)}</p>
                    <p className="text-sm">{totalM2.toFixed(2)} m² — {formatCurrency(totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground">{m.records.length} registro(s)</p>
                    {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(m)} className="p-1.5 rounded hover:bg-accent text-muted-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar esta medición?"))
                          setGlobalMeasurements((prev) => prev.filter((x) => x.id !== m.id));
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
