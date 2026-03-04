export type BrickType = {
  id: string;
  name: string;
  pricePerSquareMeter: number;
  type: "regular" | "quantity";
};

export type Multiplier = {
  id: string;
  name: string;
  value: number;
  description?: string;
};

export type Supplement = {
  id: string;
  name: string;
  price: number;
};

export type Period = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
};

export type WorkEntry = {
  id: string;
  date: string;
  brickTypeId: string;
  supplementIds?: string[];
  // Para ladrillos regulares (m²)
  linearMeters?: number;
  height?: number;
  squareMeters?: number;
  // Para trabajos por cantidad
  quantity?: number;
  pricePerUnit?: number;
  description?: string;
  // Ganancias
  baseEarnings: number;
  supplementEarnings: number;
  totalEarnings: number;
  periodId?: string;
};

export type GlobalMeasurementRecord = {
  brickTypeId: string;
  squareMeters: number;
  earnings: number;
};

export type GlobalMeasurement = {
  id: string;
  periodId: string;
  records: GlobalMeasurementRecord[];
  description?: string;
  createdAt: string;
};

export type StorageConfig = {
  type: "local" | "php";
};

