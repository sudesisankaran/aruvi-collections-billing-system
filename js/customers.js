/**
 * Customers.js - Customer Management Interface
 */

const Customers = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-customers');
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1 w-full relative">
                        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                        <input type="text" id="customer-search" placeholder="Search by name or mobile..." 
                            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all">
                    </div>
                </div>

                <!-- Table Container -->
                <div class="flex-1 overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Customer Details</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Bills</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-right">Total Spent</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-right">Last Purchase</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="customers-table-body" class="divide-y divide-slate-100">
                            <!-- Rows injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('customer-search').addEventListener('input', () => this.renderTable());
    },

    render: function() {
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('customers-table-body');
        if(!tbody) return;

        const searchTerm = document.getElementById('customer-search').value.toLowerCase();
        const customers = Store.getCustomers();

        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.mobile.includes(searchTerm)
        );

        if(filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">${UI.getEmptyState('fa-users', 'No Customers Found', 'Customers are added automatically when generating bills.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(c => {
            const lastDate = c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : 'N/A';
            return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                            ${c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-semibold text-slate-800">${c.name}</div>
                            <div class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-phone mr-1"></i>${c.mobile}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        ${c.numberOfBills || 0}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="font-bold text-emerald-600">₹${(c.totalPurchases || 0).toFixed(2)}</div>
                </td>
                <td class="p-4 text-right text-sm text-slate-600">
                    ${lastDate}
                </td>
                <td class="p-4 text-center">
                    <button onclick="Customers.viewHistory('${c.mobile}')" class="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-emerald-200 rounded-lg text-sm font-medium transition-colors">
                        View History
                    </button>
                </td>
            </tr>
        `}).join('');
    },

    viewHistory: function(mobile) {
        // Switch to history tab and search for this mobile number
        App.navigateTo('history');
        const searchInput = document.getElementById('history-search');
        if(searchInput) {
            searchInput.value = mobile;
            History.renderTable();
        }
    }
};
