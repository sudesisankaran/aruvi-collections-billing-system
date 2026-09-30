/**
 * Returns.js - Handle Bill Cancellations and Returns
 */

const Returns = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-returns');
        container.innerHTML = `
            <div class="max-w-3xl mx-auto h-full flex flex-col py-6">
                
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800">Cancel Bill / Return</h2>
                    <p class="text-slate-500 mt-2">Enter the invoice number to view details and cancel the bill. Cancelling will restore product stock.</p>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div class="flex gap-4">
                        <div class="flex-1 relative">
                            <i class="fa-solid fa-file-invoice absolute left-4 top-3.5 text-slate-400"></i>
                            <input type="text" id="return-invoice-no" placeholder="Enter Invoice Number (e.g. INV-2026-00001)" 
                                class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:bg-white outline-none font-medium transition-all">
                        </div>
                        <button onclick="Returns.searchInvoice()" class="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm">
                            Search
                        </button>
                    </div>
                </div>

                <div id="return-invoice-details" class="flex-1">
                    <!-- Invoice details injected here -->
                </div>
            </div>
        `;
    },

    render: function() {
        document.getElementById('return-invoice-no').value = '';
        document.getElementById('return-invoice-details').innerHTML = '';
    },

    searchInvoice: function() {
        const invNo = document.getElementById('return-invoice-no').value.trim().toUpperCase();
        const container = document.getElementById('return-invoice-details');
        
        if(!invNo) {
            UI.showToast('Please enter an invoice number', 'warning');
            return;
        }

        const invoices = Store.getInvoices();
        const invoice = invoices.find(i => i.invoiceNumber.toUpperCase() === invNo);

        if(!invoice) {
            container.innerHTML = UI.getEmptyState('fa-search', 'Invoice Not Found', 'Check the invoice number and try again.');
            return;
        }

        const isCancelled = invoice.status === 'Cancelled';

        let itemsHtml = invoice.items.map(item => `
            <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div>
                    <p class="text-sm font-medium text-slate-800">${item.name}</p>
                    <p class="text-xs text-slate-500">Qty: ${item.quantity} | ₹${item.price}/ea</p>
                </div>
                <div class="text-sm font-bold text-slate-800">
                    ₹${((item.price * item.quantity) - ((item.price * item.quantity)*(item.discount || 0)/100)).toFixed(2)}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border ${isCancelled ? 'border-red-200' : 'border-slate-200'} overflow-hidden">
                <div class="p-6 border-b ${isCancelled ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-200'}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                ${invoice.invoiceNumber}
                                ${isCancelled ? '<span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">CANCELLED</span>' : ''}
                            </h3>
                            <p class="text-sm text-slate-500 mt-1">${new Date(invoice.date).toLocaleString()}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-slate-600">Customer: <span class="text-slate-800 font-bold">${invoice.customer.name}</span></p>
                            <p class="text-sm text-slate-500">${invoice.customer.mobile}</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</h4>
                    <div class="mb-6">
                        ${itemsHtml}
                    </div>

                    <div class="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p class="text-sm text-slate-500">Payment: <span class="font-bold text-slate-700">${invoice.paymentMethod}</span></p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-slate-500">Grand Total</p>
                            <p class="text-xl font-bold text-primary">₹${invoice.grandTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                ${!isCancelled ? `
                <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button onclick="Returns.confirmCancel('${invoice.id}')" class="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors">
                        Cancel This Bill & Refund Stock
                    </button>
                </div>
                ` : `
                <div class="p-4 bg-red-50 border-t border-red-100 text-center text-sm font-medium text-red-600">
                    This bill was cancelled. Stock has been restored.
                </div>
                `}
            </div>
        `;
    },

    confirmCancel: function(invoiceId) {
        const html = `
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">Cancel Bill?</h3>
                <p class="text-sm text-slate-500">Are you sure you want to cancel this bill? The product stock will be automatically restored.</p>
            </div>
        `;

        UI.showModal('Confirm Cancellation', html, (modal) => {
            const success = Store.cancelInvoice(invoiceId);
            if(success) {
                UI.showToast('Bill cancelled successfully. Stock restored.', 'success');
                this.searchInvoice(); // Refresh view
                UI.closeModal(modal);
            }
        }, 'Yes, Cancel Bill', 'No, Keep It', 'max-w-sm');
    }
};
