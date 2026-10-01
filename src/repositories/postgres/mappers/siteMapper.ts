import type { SiteModel } from '../../../database/models/siteModel.js';
import type { Site } from '../../../models/sites/site.js';

export const toSite = (model: SiteModel): Site => ({
  id: model.id,
  name: model.name,
  code: model.code,
  region: model.region,
  latitude: model.latitude,
  longitude: model.longitude,
});