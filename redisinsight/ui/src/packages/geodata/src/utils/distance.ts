export const UNIT_TO_KM: Record<string, number> = {
  M: 0.001,
  KM: 1,
  FT: 0.0003048,
  MI: 1.609344,
}

export const convertToKm = (value: number, unit = 'km'): number =>
  value * (UNIT_TO_KM[unit.toUpperCase()] ?? 1)
