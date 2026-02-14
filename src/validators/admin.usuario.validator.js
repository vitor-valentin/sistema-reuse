import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";

const userSchema = Joi.object({
    nome: Joi.string().min(3).max(100).escapeHTML().required().messages({
        'string.base': 'O nome deve ser um texto',
        'string.empty': 'O nome não pode estar vazio',
        'string.min': 'O nome deve ter no mínimo {#limit} caracteres',
        'string.max': 'O nome deve ter no máximo {#limit} caracteres',
        'any.required': 'O campo nome é obrigatório'
    }),
    email: Joi.string().email().escapeHTML().required().messages({
        'string.email': 'Insira um e-mail válido',
        'string.empty': 'O e-mail não pode estar vazio',
        'any.required': 'O campo e-mail é obrigatório'
    }),
    cargo: Joi.string().max(25).escapeHTML().required().messages({
        'string.max': 'O cargo deve ter no máximo {#limit} caracteres',
        'any.required': 'O campo cargo é obrigatório'
    }),
    status: Joi.boolean().required().messages({
        'boolean.base': 'O status deve ser ativo ou inativo',
        'any.required': 'O campo status é obrigatório'
    }),
    isAdmin: Joi.boolean().required().messages({
        'any.required': 'Defina se o usuário é administrador'
    }),
    manageCategories: Joi.boolean().required().messages({
        'any.required': 'Defina a permissão de categorias'
    }),
    manageSolicitations: Joi.boolean().required().messages({
        'any.required': 'Defina a permissão de solicitações'
    }),
    senha: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .escapeHTML()
        .required()
        .allow("")
        .messages({
            'string.pattern.base': 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
            'any.required': 'O campo senha é obrigatório'
        })
});

export const validateUserData = async (req, res, next) => {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};