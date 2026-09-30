/**
 * UI.js - Handles global UI elements like toasts, modals, and navigation
 */

const UI = {
    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast-enter flex items-center p-4 mb-2 rounded-lg shadow-lg border-l-4 ${this.getToastStyle(type)} bg-white`;
        
        toast.innerHTML = `
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${this.getToastIconBgStyle(type)} mr-3">
                <i class="fa-solid ${this.getToastIcon(type)}"></i>
            </div>
            <div class="text-sm font-medium text-slate-700">${message}</div>
            <button class="ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex h-8 w-8 transition-colors" onclick="this.parentElement.remove()">
                <span class="sr-only">Close</span>
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.replace('toast-enter', 'toast-leave');
            setTimeout(() => {
                if(toast.parentElement) toast.remove();
            }, 300);
        }, 3000);
    },

    getToastStyle: function(type) {
        switch(type) {
            case 'success': return 'border-emerald-500';
            case 'error': return 'border-red-500';
            case 'warning': return 'border-amber-500';
            case 'info': return 'border-blue-500';
            default: return 'border-slate-500';
        }
    },

    getToastIconBgStyle: function(type) {
        switch(type) {
            case 'success': return 'text-emerald-500 bg-emerald-100';
            case 'error': return 'text-red-500 bg-red-100';
            case 'warning': return 'text-amber-500 bg-amber-100';
            case 'info': return 'text-blue-500 bg-blue-100';
            default: return 'text-slate-500 bg-slate-100';
        }
    },

    getToastIcon: function(type) {
        switch(type) {
            case 'success': return 'fa-check';
            case 'error': return 'fa-triangle-exclamation';
            case 'warning': return 'fa-exclamation';
            case 'info': return 'fa-info';
            default: return 'fa-bell';
        }
    },

    showModal: function(title, contentHTML, onConfirm, confirmText = 'Save', cancelText = 'Cancel', customClasses = 'max-w-md') {
        const container = document.getElementById('modals-container');
        
        const modalHtml = `
            <div class="fixed inset-0 z-50 flex items-center justify-center modal-enter">
                <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm modal-backdrop" onclick="UI.closeModal(this)"></div>
                <div class="bg-white rounded-2xl shadow-xl w-full ${customClasses} mx-4 modal-content-enter z-10 overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 class="text-lg font-semibold text-slate-800">${title}</h3>
                        <button class="text-slate-400 hover:text-slate-700 transition-colors btn-close-modal">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    <div class="px-6 py-4 overflow-y-auto custom-scrollbar">
                        ${contentHTML}
                    </div>
                    <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                        <button class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 btn-close-modal transition-colors shadow-sm">
                            ${cancelText}
                        </button>
                        ${onConfirm ? `<button class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primaryHover btn-confirm-modal transition-colors shadow-sm shadow-rose-200">${confirmText}</button>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = modalHtml;

        // Attach events
        const modalEl = container.firstElementChild;
        const closeBtns = modalEl.querySelectorAll('.btn-close-modal');
        closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeModal(modalEl)));
        
        if (onConfirm) {
            const confirmBtn = modalEl.querySelector('.btn-confirm-modal');
            confirmBtn.addEventListener('click', () => {
                onConfirm(modalEl);
            });
        }
        
        return modalEl;
    },

    closeModal: function(element) {
        let modal = element;
        if (!element.classList.contains('fixed')) {
             modal = element.closest('.fixed.z-50');
        }
        if (modal) {
            modal.classList.replace('modal-enter', 'fadeOut');
            modal.querySelector('.modal-content-enter').classList.replace('modal-content-enter', 'fadeOutDown');
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    },

    // Empty State Helper
    getEmptyState: function(icon, title, description, actionHTML = '') {
        return `
            <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                    <i class="fa-solid ${icon} text-3xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-slate-700 mb-1">${title}</h3>
                <p class="text-slate-500 mb-6 max-w-sm">${description}</p>
                ${actionHTML}
            </div>
        `;
    },

    formatCurrency: function(amount) {
        const settings = Store.getSettings();
        return `${settings.currency}${parseFloat(amount).toFixed(2)}`;
    }
};
