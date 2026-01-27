export function maskInput(input, mask) {
    const rules = {
        '9': /\d/,
        'X': /[a-zA-Z]/,
        'A': /[A-Z]/,
        'a': /[a-z]/,
        '*': /[a-zA-Z0-9]/
    };

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Backspace') return;

        const pos = input.selectionStart;
        if (pos === 0) return;

        const prevMaskChar = mask[pos - 1];
        if (!rules[prevMaskChar]) {
            input.setSelectionRange(pos - 1, pos - 1);
            e.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        const raw = input.value.replace(/[^a-zA-Z0-9]/g, '');

        let result = '';
        let rawIndex = 0;

        for (let i = 0; i < mask.length; i++) {
            const maskChar = mask[i];
            const rule = rules[maskChar];

            if (rule) {
                while (rawIndex < raw.length && !rule.test(raw[rawIndex])) {
                    rawIndex++;
                }
                if (rawIndex < raw.length) {
                    result += raw[rawIndex++];
                } else break;
            } else {
                result += maskChar;
            }
        }

        input.value = result;
    });
}

export function stripMaskNumber(value) {
    if (!value) return null;

    return value.replace(/\D/g, "");
}