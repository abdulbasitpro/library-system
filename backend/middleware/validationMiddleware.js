const Joi = require('joi');

// HOF — returns middleware that validates req.body against the given Joi schema
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // Return all errors at once
    stripUnknown: true,   // Remove unknown fields
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('. ');
    return res.status(400).json({ success: false, message });
  }

  req.body = value; // Use sanitized value
  next();
};

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('member', 'admin').default('member'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().min(1).max(100).required(),
  isbn: Joi.string().min(5).max(20).required(),
  category: Joi.string()
    .valid('Fiction','Non-Fiction','Science','Technology','History','Biography',
           'Literature','Philosophy','Self-Help','Business','Children','Other')
    .required(),
  description: Joi.string().max(1000).allow('').optional(),
  quantity: Joi.number().integer().min(1).required(),
  availableCopies: Joi.number().integer().min(0).optional(),
  coverImageURL: Joi.string().uri().allow('').optional(),
  publishedYear: Joi.number().integer().min(1000).max(2100).optional(),
});

const transactionSchema = Joi.object({
  bookId: Joi.string().required(),
  dueDate: Joi.date().greater('now').optional(), // defaults to 14 days in controller
  notes: Joi.string().max(500).allow('').optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  bookSchema,
  transactionSchema,
};
