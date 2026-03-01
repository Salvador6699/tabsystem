import React, { useState } from "react";
import {
  BrickType,
  Period,
  Multiplier,
  WorkEntry,
  GlobalMeasurement,
  StorageConfig,
} from "../types";
import { generateId, formatCurrency } from "../lib/utils";
import { Plus, Trash2, Pencil, Download, Upload } from "lucide-react";

type Props = {
  brickTypes: BrickType[];
  setBrickTypes: (v: BrickType[] | ((prev: BrickType[]) => BrickType[])) => void;
  periods: Period[];
  setPeriods: (v: Period[] | ((prev: Period[]) => Period[])) => void;
  multipliers: Multiplier[];
  setMultipliers: (v: Multiplier[] | ((prev: Multiplier[]) => Multiplier[])) => void;
  workEntries: WorkEntry[];
  setWorkEntries: (v: WorkEntry[] | ((prev: WorkEntry[]) => WorkEntry[])) => void;
  globalMeasurements: GlobalMeasurement[];
  setGlobalMeasurements: (v: GlobalMeasurement[] | ((prev: GlobalMeasurement[]) => GlobalMeasurement[])) => void;
  storageConfig: StorageConfig;
  updateStorageConfig: (config: StorageConfig) => void;
  isConnecting: boolean;
  connectionError: string | null;
  syncToDatabase: () => Promise<void>;
  syncFromDatabase: () => Promise<void>;
};

export const Settings: React.FC<Props> = ({
  brickTypes,
  setBrickTypes,
  periods,
  setPeriods,
  multipliers,
  setMultipliers,
  workEntries,
  setWorkEntries,
  globalMeasurements,
  setGlobalMeasurements,
  storageConfig,
  updateStorageConfig,
  isConnecting,
  connectionError,
  syncToDatabase,
  syncFromDatabase,
}) => {

  const [tab, setTab] = useState<"bricks" | "periods" | "multipliers" | "data">("bricks");

  // Brick type form
  const [newBrickName, setNewBrickName] = useState("");
  const [newBrickPrice, setNewBrickPrice] = useState("");
  const [newBrickType, setNewBrickType] = useState<"regular" | "quantity">("regular");
  const [editingBrick, setEditingBrick] = useState<BrickType | null>(null);

  // Period form
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodStart, setNewPeriodStart] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  // Multiplier form
  const [newMultName, setNewMultName] = useState("");
  const [newMultValue, setNewMultValue] = useState("");
  const [newMultDesc, setNewMultDesc] = useState("");

  const addBrick = () => {
    if (!newBrickName || !newBrickPrice) {
      alert("El nombre y el precio son obligatorios");
      return;
    }
    const brick: BrickType = {
      id: editingBrick?.id || generateId(),
      name: newBrickName,
      pricePerSquareMeter: parseFloat(newBrickPrice),
      type: newBrickType,
    };
    if (editingBrick) {
      setBrickTypes((prev) => prev.map((b) => (b.id === editingBrick.id ? brick : b)));
      setEditingBrick(null);
    } else {
      setBrickTypes((prev) => [...prev, brick]);
    }
    setNewBrickName("");
    setNewBrickPrice("");
    setNewBrickType("regular");
  };

  const startEditBrick = (b: BrickType) => {
    setEditingBrick(b);
    setNewBrickName(b.name);
    setNewBrickPrice(b.pricePerSquareMeter.toString());
    setNewBrickType(b.type);
  };

  const addPeriod = () => {
    if (!newPeriodName || !newPeriodStart) {
      alert("El nombre y la fecha de inicio son obligatorios");
      return;
    }
    const period: Period = {
      id: editingPeriod?.id || generateId(),
      name: newPeriodName,
      startDate: newPeriodStart,
      endDate: newPeriodEnd || undefined,
    };
    if (editingPeriod) {
      setPeriods((prev) => prev.map((p) => (p.id === editingPeriod.id ? period : p)));
      setEditingPeriod(null);
    } else {
      setPeriods((prev) => [...prev, period]);
    }
    setNewPeriodName("");
    setNewPeriodStart("");
    setNewPeriodEnd("");
  };

  const addMultiplier = () => {
    if (!newMultName || !newMultValue) {
      alert("El nombre y el valor son obligatorios");
      return;
    }
    const mult: Multiplier = {
      id: generateId(),
      name: newMultName,
      value: parseFloat(newMultValue),
      description: newMultDesc || undefined,
    };
    setMultipliers((prev) => [...prev, mult]);
    setNewMultName("");
    setNewMultValue("");
    setNewMultDesc("");
  };

  const exportData = () => {
    const data = {
      workEntries,
      brickTypes,
      periods,
      multipliers,
      globalMeasurements,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tabsystem-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.workEntries) setWorkEntries(data.workEntries);
        if (data.brickTypes) setBrickTypes(data.brickTypes);
        if (data.periods) setPeriods(data.periods);
        if (data.multipliers) setMultipliers(data.multipliers);
        if (data.globalMeasurements) setGlobalMeasurements(data.globalMeasurements);
        alert("Datos importados exitosamente");
      } catch {
        alert("El archivo no tiene la estructura correcta");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const tabs = [
    { id: "bricks", label: "Gestión de Tipos de Ladrillo" },
    { id: "periods", label: "Gestión de Períodos" },
    { id: "multipliers", label: "Gestión de Multiplicadores" },
    { id: "data", label: "Base de Datos y Backup" },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-accent/50 rounded-lg p-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tipos de ladrillo */}
      {tab === "bricks" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">
              {editingBrick ? "Editar Tipo" : "Agregar Tipo de Ladrillo"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newBrickName}
                onChange={(e) => setNewBrickName(e.target.value)}
                placeholder="Ej: Ladrillo hueco 7"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                step="0.01"
                value={newBrickPrice}
                onChange={(e) => setNewBrickPrice(e.target.value)}
                placeholder="Precio por m²"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newBrickType}
                onChange={(e) => setNewBrickType(e.target.value as "regular" | "quantity")}
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="regular">Ladrillo Regular (m²)</option>
                <option value="quantity">Por Cantidad</option>
              </select>
            </div>
            <button
              onClick={addBrick}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {editingBrick ? "Actualizar" : "Agregar"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {brickTypes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No hay tipos de ladrillo configurados
              </p>
            ) : (
              brickTypes.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3 border-b last:border-0 border-border"
                >
                  <div>
                    <p className="font-medium text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(b.pricePerSquareMeter)}/{b.type === "regular" ? "m²" : "ud"} ·{" "}
                      {b.type === "regular" ? "Ladrillos Regulares" : "Por Cantidad"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditBrick(b)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este tipo?"))
                          setBrickTypes((prev) => prev.filter((x) => x.id !== b.id));
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Períodos */}
      {tab === "periods" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">
              {editingPeriod ? "Editar Período" : "Agregar Período"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
                placeholder="Nombre del período"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Fecha de fin (opcional)</label>
                <input
                  type="date"
                  value={newPeriodEnd}
                  onChange={(e) => setNewPeriodEnd(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={addPeriod}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {editingPeriod ? "Actualizar Período" : "Agregar Período"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {periods.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No hay períodos configurados
              </p>
            ) : (
              periods.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 border-b last:border-0 border-border"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.startDate).toLocaleDateString("es-ES")}
                      {p.endDate
                        ? ` — ${new Date(p.endDate).toLocaleDateString("es-ES")}`
                        : " (en curso)"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPeriod(p);
                        setNewPeriodName(p.name);
                        setNewPeriodStart(p.startDate);
                        setNewPeriodEnd(p.endDate || "");
                      }}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este período?"))
                          setPeriods((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Multiplicadores */}
      {tab === "multipliers" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Agregar Multiplicador</h3>
            <p className="text-xs text-muted-foreground">
              Factores de dificultad para trabajos regulares únicamente. Ejemplo: trabajo nocturno ×1.2
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={newMultName}
                onChange={(e) => setNewMultName(e.target.value)}
                placeholder="Ej: Trabajo nocturno"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                step="0.01"
                value={newMultValue}
                onChange={(e) => setNewMultValue(e.target.value)}
                placeholder="Valor (ej: 1.2)"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={newMultDesc}
                onChange={(e) => setNewMultDesc(e.target.value)}
                placeholder="Descripción opcional"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={addMultiplier}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Agregar Multiplicador
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {multipliers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No hay multiplicadores configurados
              </p>
            ) : (
              multipliers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3 border-b last:border-0 border-border"
                >
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ×{m.value}
                      {m.description ? ` · ${m.description}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar este multiplicador?"))
                        setMultipliers((prev) => prev.filter((x) => x.id !== m.id));
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Gestión de Datos y Base de Datos */}
      {tab === "data" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Sincronización con Base de Datos (MySQL/PHP)
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta aplicación puede funcionar de forma local (en este navegador) o sincronizada con una base de datos MySQL mediante PHP.
            </p>

            {connectionError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {connectionError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Persistencia en la Nube</p>
                  <p className="text-xs text-muted-foreground">
                    Sincronización manual para evitar pérdida accidental de datos.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${storageConfig.type === "php" ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border"
                    }`}>
                    {storageConfig.type === "php" ? "Modo Nube Activo" : "Modo Solo Local"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={syncToDatabase}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isConnecting ? "Guardando..." : "Guardar en la Nube (Todo)"}
                </button>
                <button
                  onClick={syncFromDatabase}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-lg text-sm hover:bg-accent disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isConnecting ? "Descargando..." : "Cargar de la Nube (Todo)"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Backup Manual (Archivo JSON)
            </h3>
            <p className="text-sm text-muted-foreground">
              Exporta o importa tus datos manualmente mediante archivos .json.
            </p>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent"
              >
                <Download className="w-4 h-4" />
                Exportar JSON
              </button>
              <label className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent/80 cursor-pointer">
                <Upload className="w-4 h-4" />
                Importar JSON
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
