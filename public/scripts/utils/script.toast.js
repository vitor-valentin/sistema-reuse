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

            el.addEventListener('transitionend', () => {
                el.remove();

                if (container.childNodes.length === 0) {
                    container.remove();
                }
            }, { once: true });

        }, duration);
    },

    confirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-darkblue/20 backdrop-blur-sm z-[110] flex items-center justify-center p-4';
            
            const box = document.createElement('div');
            box.className = 'bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-95 opacity-0 border border-cyangrey';
            
            box.innerHTML = `
                <div class="text-center">
                    <div class="w-16 h-16 bg-lightred text-red rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-darkblue mb-2">Tem certeza?</h3>
                    <p class="text-darkcyangrey mb-6">${message}</p>
                    <div class="flex gap-3">
                        <button id="toast-cancel" class="flex-1 px-4 py-2.5 rounded-xl text-darkcyangrey hover:bg-lightgray font-medium transition-all">
                            Cancelar
                        </button>
                        <button id="toast-confirm" class="flex-1 px-4 py-2.5 rounded-xl bg-red text-white font-medium hover:opacity-90 shadow-lg shadow-red/20 transition-all">
                            Confirmar
                        </button>
                    </div>
                </div>
            `;

            overlay.appendChild(box);
            document.body.appendChild(overlay);

            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
            }, 10);

            const close = (result) => {
                box.classList.add('scale-95', 'opacity-0');
                overlay.classList.add('opacity-0');
                
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            };

            overlay.querySelector('#toast-confirm').onclick = () => close(true);
            overlay.querySelector('#toast-cancel').onclick = () => close(false);
            
            overlay.onclick = (e) => { if(e.target === overlay) close(false); };
        });
    }
};