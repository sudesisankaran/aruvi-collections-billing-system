/**
 * History.js - Billing History and PDF Generation
 */

const History = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-history');
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header & Filters -->
                <div class="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1 w-full relative">
                        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                        <input type="text" id="history-search" placeholder="Search invoices, customers, mobile..." 
                            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-primary outline-none transition-all">
                    </div>
                    <div class="flex gap-3 w-full sm:w-auto">
                        <select id="history-filter-date" class="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium text-slate-600 flex-1 sm:flex-none">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-1 overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Invoice No</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Customer</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Amount</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Payment</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body" class="divide-y divide-slate-100">
                            <!-- Rows injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('history-search').addEventListener('input', () => this.renderTable());
        document.getElementById('history-filter-date').addEventListener('change', () => this.renderTable());
    },

    render: function() {
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('history-table-body');
        if(!tbody) return;

        const searchTerm = document.getElementById('history-search').value.toLowerCase();
        const dateFilter = document.getElementById('history-filter-date').value;
        const invoices = Store.getInvoices();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

        const filtered = invoices.filter(inv => {
            const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm) || 
                                  inv.customer.name.toLowerCase().includes(searchTerm) || 
                                  inv.customer.mobile.includes(searchTerm);
            
            const invDate = new Date(inv.date);
            let matchesDate = true;
            
            if(dateFilter === 'today') matchesDate = invDate >= today;
            else if(dateFilter === 'week') matchesDate = invDate >= weekAgo;
            else if(dateFilter === 'month') matchesDate = invDate >= monthAgo;

            return matchesSearch && matchesDate;
        });

        if(filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${UI.getEmptyState('fa-file-invoice', 'No Bills Found', 'No billing history matches your search.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(inv => {
            const dateStr = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const isCancelled = inv.status === 'Cancelled';
            
            return `
            <tr class="hover:bg-slate-50 transition-colors ${isCancelled ? 'opacity-60' : ''}">
                <td class="p-4">
                    <span class="font-medium text-slate-800">${inv.invoiceNumber}</span>
                    ${isCancelled ? '<span class="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">CANCELLED</span>' : ''}
                </td>
                <td class="p-4">
                    <div class="font-medium text-slate-800">${inv.customer.name}</div>
                    <div class="text-xs text-slate-500">${inv.customer.mobile}</div>
                </td>
                <td class="p-4 text-sm text-slate-600">${dateStr}</td>
                <td class="p-4 font-semibold text-slate-800 text-sm">₹${inv.grandTotal.toFixed(2)}</td>
                <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        inv.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 
                        inv.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }">
                        <i class="fa-solid ${inv.paymentMethod === 'Cash' ? 'fa-money-bill' : inv.paymentMethod === 'UPI' ? 'fa-qrcode' : 'fa-credit-card'}"></i>
                        ${inv.paymentMethod}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="History.viewInvoice('${inv.id}')" class="w-8 h-8 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="View">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                        <button onclick="History.generatePDF('${inv.id}', true)" class="w-8 h-8 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Download PDF">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button onclick="POS.sendWhatsApp('${inv.id}')" class="w-8 h-8 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');
    },

    viewInvoice: function(id) {
        const invoice = Store.getInvoices().find(i => i.id === id);
        if(!invoice) return;

        const settings = Store.getSettings();
        const dateStr = new Date(invoice.date).toLocaleString('en-US');
        
        let itemsHtml = invoice.items.map(item => `
            <tr>
                <td class="py-2 text-sm text-slate-800">${item.name} <br><span class="text-xs text-slate-500">${item.size} | ${item.color}</span></td>
                <td class="py-2 text-sm text-slate-600 text-center">${item.quantity}</td>
                <td class="py-2 text-sm text-slate-600 text-right">₹${item.price}</td>
                <td class="py-2 text-sm text-slate-800 text-right font-medium">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <div id="invoice-print-area" class="bg-white p-6 rounded border border-slate-200">
                <div class="text-center mb-6 border-b border-slate-200 pb-4">
                    <h2 class="text-2xl font-bold text-slate-800 uppercase tracking-wider">${settings.shopName}</h2>
                    <p class="text-sm text-slate-500 mt-1">${settings.address}</p>
                    <p class="text-sm text-slate-500">Ph: ${settings.phone} | Email: ${settings.email}</p>
                    ${settings.gstNumber ? `<p class="text-sm text-slate-500">GST: ${settings.gstNumber}</p>` : ''}
                </div>
                
                <div class="flex justify-between mb-6">
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-bold mb-1">Billed To</p>
                        <p class="font-semibold text-slate-800">${invoice.customer.name}</p>
                        <p class="text-sm text-slate-600">Ph: ${invoice.customer.mobile}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-400 uppercase font-bold mb-1">Invoice Details</p>
                        <p class="font-bold text-slate-800">${invoice.invoiceNumber}</p>
                        <p class="text-sm text-slate-600">${dateStr}</p>
                    </div>
                </div>
                
                <table class="w-full mb-6 text-left">
                    <thead class="border-b border-slate-200">
                        <tr>
                            <th class="py-2 text-xs font-bold text-slate-500 uppercase">Item</th>
                            <th class="py-2 text-xs font-bold text-slate-500 uppercase text-center">Qty</th>
                            <th class="py-2 text-xs font-bold text-slate-500 uppercase text-right">Price</th>
                            <th class="py-2 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="flex justify-end border-t border-slate-200 pt-4">
                    <div class="w-1/2 space-y-2">
                        <div class="flex justify-between text-sm text-slate-600">
                            <span>Subtotal:</span>
                            <span>₹${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-sm text-emerald-600">
                            <span>Discount:</span>
                            <span>-₹${invoice.discount.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-200">
                            <span>Grand Total:</span>
                            <span class="text-primary">₹${invoice.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-8 text-center text-xs text-slate-400">
                    <p class="font-medium">${invoice.paymentMethod} - ${invoice.status}</p>
                    <p class="mt-2">${settings.invoiceFooter}</p>
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-4">
                 <button onclick="History.generatePDF('${id}', true)" class="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-medium text-sm transition-colors">
                    <i class="fa-solid fa-download mr-1"></i> Download PDF
                </button>
                <button onclick="History.generatePDF('${id}', false, true)" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors">
                    <i class="fa-solid fa-print mr-1"></i> Print
                </button>
            </div>
        `;

        UI.showModal(`Invoice: ${invoice.invoiceNumber}`, html, null, '', 'Close', 'max-w-2xl');
    },

    generatePDF: function(id, download = true, print = false) {
        const invoice = Store.getInvoices().find(i => i.id === id);
        const settings = Store.getSettings();
        if(!invoice) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const dateObj = new Date(invoice.date);
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString();

        // Shop Header
        doc.setFontSize(22);
        doc.setTextColor(225, 29, 72); // Rose 600
        doc.setFont("helvetica", "bold");
        doc.text(settings.shopName, 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(settings.address, 105, 28, { align: "center" });
        doc.text(`Ph: ${settings.phone} | Email: ${settings.email}`, 105, 34, { align: "center" });
        if(settings.gstNumber) doc.text(`GST: ${settings.gstNumber}`, 105, 40, { align: "center" });

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 45, 196, 45);

        // Invoice Info
        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 14, 55);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 62);
        doc.text(`Date: ${dateStr}`, 14, 68);
        doc.text(`Time: ${timeStr}`, 14, 74);

        // Customer Info
        doc.setFont("helvetica", "bold");
        doc.text("Billed To:", 120, 55);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.customer.name, 120, 62);
        doc.text(`Ph: ${invoice.customer.mobile}`, 120, 68);

        // Items Table
        const tableBody = invoice.items.map(item => [
            `${item.name}\n${item.size} | ${item.color}`,
            item.quantity,
            `Rs. ${item.price.toFixed(2)}`,
            `Rs. ${((item.price * item.quantity) * (item.discount || 0)/100).toFixed(2)}`,
            `Rs. ${(item.price * item.quantity - ((item.price * item.quantity) * (item.discount || 0)/100)).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 85,
            head: [['Product Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [244, 63, 94] }, // Rose 500
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' }
            }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(10);
        doc.text("Subtotal:", 140, finalY);
        doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, 190, finalY, { align: "right" });
        
        doc.text("Total Discount:", 140, finalY + 7);
        doc.text(`-Rs. ${invoice.discount.toFixed(2)}`, 190, finalY + 7, { align: "right" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(225, 29, 72);
        doc.text("Grand Total:", 140, finalY + 17);
        doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, 190, finalY + 17, { align: "right" });

        // Payment Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Payment Method: ${invoice.paymentMethod}`, 14, finalY);
        doc.text(`Payment Status: ${invoice.status}`, 14, finalY + 7);

        // Footer
        doc.setFontSize(9);
        doc.text(settings.invoiceFooter, 105, 280, { align: "center" });

        if(print) {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else if (download) {
            doc.save(`${invoice.invoiceNumber}.pdf`);
            UI.showToast('PDF Downloaded successfully', 'success');
        }
    }
};
