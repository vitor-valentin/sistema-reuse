import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

export const JoiHtmlExtension = Joi.extend((joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} não deve conter tags HTML.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                
                return clean;
            }
        }
    }
}));