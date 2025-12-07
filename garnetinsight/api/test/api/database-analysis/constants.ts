import { Joi } from '../../helpers/test';

export const typedRecommendationSchema = Joi.object({
  name: Joi.string().required(),
  vote: Joi.string(),
  params: Joi.any(),
});

export const typedTotalSchema = Joi.object({
  total: Joi.number().integer().required(),
  types: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      total: Joi.number().integer().required(),
    }),
  ),
});

export const nspSummarySchema = Joi.object({
  nsp: Joi.string().required(),
  memory: Joi.number().integer().required(),
  keys: Joi.number().integer().required(),
  types: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      memory: Joi.number().integer().required(),
      keys: Joi.number().integer().required(),
    }),
  ),
});

export const keySchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  memory: Joi.number().integer().required(),
  length: Joi.number().integer().required(),
  ttl: Joi.number().integer().required(),
});

export const sumGroupSchema = Joi.object({
  label: Joi.string().required(),
  total: Joi.number().integer().required(),
  threshold: Joi.number().integer().required(),
});

export const analysisSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    databaseId: Joi.string().required(),
    delimiter: Joi.string().required(),
    createdAt: Joi.date().required(),
    filter: Joi.object({
      type: Joi.string().allow(null),
      match: Joi.string().required(),
      count: Joi.number().integer().required(),
    }).required(),
    progress: Joi.object({
      total: Joi.number().integer().required(),
      scanned: Joi.number().integer().required(),
      processed: Joi.number().integer().required(),
    }).required(),
    totalKeys: typedTotalSchema.required(),
    totalMemory: typedTotalSchema.required(),
    db: Joi.number().integer().allow(null),
    topKeysNsp: Joi.array().items(nspSummarySchema).required().max(15),
    topMemoryNsp: Joi.array().items(nspSummarySchema).required().max(15),
    topKeysLength: Joi.array().items(keySchema).required().max(15),
    topKeysMemory: Joi.array().items(keySchema).required().max(15),
    expirationGroups: Joi.array().items(sumGroupSchema).required(),
    recommendations: Joi.array().items(typedRecommendationSchema).required(),
  })
  .required();
