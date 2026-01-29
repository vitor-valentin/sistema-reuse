export const toast = {
    show(message, type = "success", duration = 3000) {
        let container = document.getElementById('toast-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-5 right-5 z-[100] flex flex-col gap-3';
            document.body.appendChild(container);
        }

        const styles = {
            success: {
                bg: 'bg-lightgreen',
                border: 'border-green',
                text: 'text-darkgreen',
                icon: '✓'
            },
            error: {
                bg: 'bg-lightred',
            border: 'border-red',
            text: 'text-darkred',
            icon: '✕'
            }
        };

        const style = styles[type] || styles.success;

        const el = document.createElement('div');
        el.className = `flex items-center p-4 min-w-[300px] rounded-lg border-l-4 shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${style.bg} ${style.text} ${style.border}`;

        el.innerHTML = `
            <span class="font-bold mr-3">${style.icon}</span>
            <p class="text-md font-medium">${message}</p>
        `;

        container.appendChild(el);

        setTimeout(() => {
            el.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        setTimeout(() => {
            el.classList.add('translate-x-full', 'opacity-0');
        }, duration);
    }
};