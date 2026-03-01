import React, { useState } from "react";
import { BrickType, Multiplier, WorkEntry } from "../types";
import { generateId } from "../lib/utils";

type Props = {
  brickTypes: BrickType[];
  multipliers: Multiplier[];
  initialData?: WorkEntry;
  onSave: (entry: WorkEntry) => void;
  onCancel: () => void;
};

export const WorkEntryForm: React.FC<Props> = ({
  brickTypes,
  multipliers,
  initialData,
  onSave,
  onCancel,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialData?.date || today);
  const [brickTypeId, setBrickTypeId] = useState(initialData?.brickTypeId || brickTypes[0]?.id || "");
  const [selectedMultiplierIds, setSelectedMultiplierIds] = useState<string[]>(
    initialData?.supplementIds || []
  );
  const [linearMeters, setLinearMeters] = useState(
    initialData?.linearMeters?.toString() || ""
  );
  const [height, setHeight] = useState(initialData?.height?.toString() || "");
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "");
  const [pricePerUnit, setPricePerUnit] = useState(
    initialData?.pricePerUnit?.toString() || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [periodId, setPeriodId] = useState(initialData?.periodId || "");

  const selectedBrick = brickTypes.find((b) => b.id === brickTypeId);
  const isRegular = selectedBrick?.type === "regular";

  const calcSquareMeters = () => {
    const lm = parseFloat(linearMeters) || 0;
    const h = parseFloat(height) || 0;
    return lm * h;
  };

  const calcEarnings = () => {
    if (!selectedBrick) return { base: 0, supplement: 0, total: 0 };

    let base = 0;
    if (isRegular) {
      const m2 = calcSquareMeters();
      base = m2 * selectedBrick.pricePerSquareMeter;
    } else {
      const qty = parseFloat(quantity) || 0;
      const price = parseFloat(pricePerUnit) || selectedBrick.pricePerSquareMeter;
      base = qty * price;
    }

    const supplementMultiplier = selectedMultiplierIds.reduce((acc, id) => {
      const mult = multipliers.find((m) => m.id === id);
      return mult ? acc * mult.value : acc;
    }, 1);

    const total = base * supplementMultiplier;
    const supplement = total - base;

    return { base, supplement, total };
  };

  const { base, supplement, total } = calcEarnings();
  const squareMeters = isRegular ? calcSquareMeters() : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brickTypeId) return;

    const entry: WorkEntry = {
      id: initialData?.id || generateId(),
      date,
      brickTypeId,
      supplementIds: selectedMultiplierIds.length > 0 ? selectedMultiplierIds : undefined,
      linearMeters: isRegular ? parseFloat(linearMeters) || 0 : undefined,
      height: isRegular ? parseFloat(height) || 0 : undefined,
      squareMeters,
      quantity: !isRegular ? parseFloat(quantity) || 0 : undefined,
      pricePerUnit: !isRegular ? parseFloat(pricePerUnit) || 0 : undefined,
      description: description || undefined,
      baseEarnings: base,
      supplementEarnings: supplement,
      totalEarnings: total,
      periodId: periodId || undefined,
    };

    onSave(entry);
  };

  const toggleMultiplier = (id: string) => {
    setSelectedMultiplierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6 text-foreground">
        {initialData ? "Editar Registro de Trabajo" : "Añadir Registro"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            Fecha del trabajo
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tipo de ladrillo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            Tipo de trabajo
          </label>
          <select
            value={brickTypeId}
            onChange={(e) => setBrickTypeId(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {brickTypes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.type === "regular" ? `${b.pricePerSquareMeter}€/m²` : `${b.pricePerSquareMeter}€/ud`}
              </option>
            ))}
          </select>
        </div>

        {/* Campos según tipo */}
        {isRegular ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Metros lineales
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={linearMeters}
                onChange={(e) => setLinearMeters(e.target.value)}
                placeholder="0.00"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Altura (m)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0.00"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {squareMeters !== undefined && squareMeters > 0 && (
              <div className="col-span-2 text-sm text-muted-foreground">
                m² calculados: <strong>{squareMeters.toFixed(2)}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Número de unidades
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Precio por unidad (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder={selectedBrick?.pricePerSquareMeter.toString() || "0.00"}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Multiplicadores */}
        {multipliers.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Multiplicadores
            </label>
            <div className="flex flex-wrap gap-2">
              {multipliers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMultiplier(m.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedMultiplierIds.includes(m.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary"
                  }`}
                >
                  {m.name} (×{m.value})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del trabajo realizado..."
            rows={2}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Preview ganancias */}
        {total > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-1">
            <p className="text-sm text-muted-foreground">
              Base: <strong>{base.toFixed(2)}€</strong>
            </p>
            {supplement > 0 && (
              <p className="text-sm text-muted-foreground">
                Suplementos: <strong>+{supplement.toFixed(2)}€</strong>
              </p>
            )}
            <p className="font-semibold text-foreground">
              Total: {total.toFixed(2)}€
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-border rounded-lg py-2 text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors font-medium"
          >
            {initialData ? "Actualizar" : "Añadir Registro"}
          </button>
        </div>
      </form>
    </div>
  );
};
