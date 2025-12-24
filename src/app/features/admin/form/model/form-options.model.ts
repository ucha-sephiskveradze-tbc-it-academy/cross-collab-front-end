export type LocationType = 'in-person' | 'virtual' | 'hybrid';

export interface CategoryOption {
  label: string;
  value: string;
}

export interface LocationOption {
  label: string;
  value: LocationType;
}

