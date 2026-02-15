import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";

const categorySchema = Joi.object({
    nome: Joi.string()
        .min(3)
        .max(100)
        .escapeHTML()
        .required()
        .messages({
            'string.base': 'O nome deve ser um texto.',
            'string.empty': 'O nome da categoria não pode estar vazio.',
            'string.min': 'O nome deve ter no mínimo {#limit} caracteres.',
            'string.max': 'O nome deve ter no máximo {#limit} caracteres.',
            'any.required': 'O nome da categoria é obrigatório.'
        }),
    
    descricao: Joi.string()
        .escapeHTML()
        .required()
        .messages({
            'string.base': 'A descrição deve ser um texto.',
            'string.empty': 'A descrição não pode estar vazia.',
            'any.required': 'A descrição da categoria é obrigatória.'
        })
});

export const validateCategoryData = async (req, res, next) => {
    const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};