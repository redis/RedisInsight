import { Joi, JoiRedisString } from '../../helpers/test';

export const recommendationSchema = Joi.object({
  read: Joi.boolean().required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  disabled: Joi.boolean(),
  hide: Joi.boolean(),
  vote: Joi.string().valid('very useful', 'useful', 'not useful').allow(null),
  createdAt: Joi.date(),
  databaseId: Joi.string(),
  params: Joi.object({
    keys: Joi.array().items(JoiRedisString),
  }).allow(null),
});

export const recommendationsSchema = Joi.object({
  recommendations: Joi.array().items(recommendationSchema),
  totalUnread: Joi.number().required(),
});
