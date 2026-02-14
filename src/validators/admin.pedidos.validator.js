import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";

const solicitationSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'any.required': 'O campo id é obrigatório',
        'any.empty': 'O id não pode estar vazio',
        'any.base': 'O id deve ser um número'
    }),
    status: Joi.string().valid('aprovado', 'recusado').required().messages({
        'any.only': 'O status deve ser "aprovado" ou "recusado"',
        'any.required': 'O campo status é obrigatório'
    })
});

export const validateSolicitationData = async (req, res, next) => {
    const { error, value } = solicitationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};