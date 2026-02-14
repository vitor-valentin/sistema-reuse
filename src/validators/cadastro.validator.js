import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";
import fs from "fs";
import { validateCNPJ, validateCPF } from "../utils/documentValidators.js";

const empresaSchema = Joi.object({
    cnpj: Joi.string().required().custom((value, helpers) => {
        if (!validateCNPJ(value)) return helpers.message('CNPJ inválido');
        return value;
    }).messages({
        'string.empty': 'O CNPJ é obrigatório',
        'any.required': 'O CNPJ é obrigatório'
    }),

    razao_social: Joi.string().min(3).max(255).escapeHTML().required().messages({
        'string.min': 'A Razão Social deve ter pelo menos {#limit} caracteres',
        'string.empty': 'A Razão Social não pode estar vazia',
        'any.required': 'A Razão Social é obrigatória'
    }),

    nome_fantasia: Joi.string().min(3).max(255).escapeHTML().allow('', null).messages({
        'string.min': 'O Nome Fantasia deve ter pelo menos {#limit} caracteres'
    }),

    email_corp: Joi.string().email().required().messages({
        'string.email': 'Informe um e-mail corporativo válido',
        'string.empty': 'O e-mail é obrigatório'
    }),

    telefone: Joi.string().min(10).max(11).escapeHTML().required().messages({
        'string.min': 'O telefone deve ter entre 10 e 11 dígitos',
        'string.max': 'O telefone deve ter no máximo 11 dígitos',
        'string.empty': 'O telefone é obrigatório'
    }),

    nome_resp: Joi.string().min(3).max(100).escapeHTML().required().messages({
        'string.min': 'O nome do responsável deve ter pelo menos {#limit} caracteres',
        'string.empty': 'O nome do responsável é obrigatório'
    }),

    cpf_resp: Joi.string().required().custom((value, helpers) => {
        if (!validateCPF(value)) return helpers.message('CPF inválido');
        return value;
    }).messages({
        'string.empty': 'O CPF é obrigatório'
    }),

    senha: Joi.string().min(8).escapeHTML().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
        'string.min': 'A senha deve ter no mínimo {#limit} caracteres',
        'string.pattern.base': 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
        'string.empty': 'A senha é obrigatória'
    }),

    cep: Joi.string().length(8).escapeHTML().required().messages({
        'string.length': 'O CEP deve ter exatamente {#limit} dígitos',
        'string.empty': 'O CEP é obrigatório'
    }),

    estado: Joi.string().escapeHTML().required().messages({ 'string.empty': 'O estado é obrigatório' }),
    cidade: Joi.string().escapeHTML().required().messages({ 'string.empty': 'A cidade é obrigatória' }),
    bairro: Joi.string().escapeHTML().required().messages({ 'string.empty': 'O bairro é obrigatório' }),
    endereco: Joi.string().escapeHTML().required().messages({ 'string.empty': 'O endereço é obrigatório' }),
    numero: Joi.string().escapeHTML().required().messages({ 'string.empty': 'O número é obrigatório' }),
    
    complemento: Joi.string().escapeHTML().allow('', null),

    publicKey: Joi.string().escapeHTML().required().messages({ 'any.required': 'Erro interno: Chave pública ausente' }),
    privateKey: Joi.string().escapeHTML().required().messages({ 'any.required': 'Erro interno: Chave privada ausente' }),
    salt: Joi.string().escapeHTML().required().messages({ 'any.required': 'Erro interno: Salt ausente' }),
    iv: Joi.string().escapeHTML().required().messages({ 'any.required': 'Erro interno: IV ausente' })
});

export const validateRegistration = async (req, res, next) => {
    const { error, value } = empresaSchema.validate(req.body, { abortEarly: false });

    if (error) {
        if (req.files) {
            const allFiles = Object.values(req.files).flat();
            
            await Promise.all(allFiles.map(async (file) => {
                try {
                    await fs.unlink(file.path);
                } catch (err) {
                    console.error(`[-] Failed to delete temp file: ${file.path}`, err);
                }
            }));
        }
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};