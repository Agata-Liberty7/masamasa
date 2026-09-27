import type { FatType } from "./fermentationModel";

export const FAT_WATER_CONTENT: Record<FatType, number> = {
  none: 0,
  butter: 0.1617,
  oil: 0,
  ghee: 0.005,
  margarine: 0.1652,
};

export function getFatWaterContent(fatType: FatType): number {
  return FAT_WATER_CONTENT[fatType] ?? 0;
}

export function calculateFatWater(
  fatGrams: number,
  fatType: FatType
): number {
  return Math.round(
    fatGrams * getFatWaterContent(fatType)
  );
}
