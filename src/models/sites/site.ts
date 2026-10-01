export interface Site {
  id: string;
  name: string;
  code: string;
  region: string;
  latitude: number;
  longitude: number;
}

export type CreateSiteInput = Omit<Site, 'id'>;

export type UpdateSiteInput = Partial<CreateSiteInput>;