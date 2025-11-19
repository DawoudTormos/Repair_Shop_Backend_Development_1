const Joi = require('joi');

const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: error.details.message,
    });
  }
  next();
};

const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  validateId: validateParams(idSchema),
};