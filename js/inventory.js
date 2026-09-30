/**
 * Inventory.js - Stock Management Interface
 */

const Inventory = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-inventory');
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1 w-full relative">
                        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                        <input type="text" id="inventory-search" placeholder="Search stock..." 
                            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all">
                    </div>
                    <select id="inventory-filter" class="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium text-slate-600">
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock (≤ 5)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>

                <!-- Table Container -->
                <div class="flex-1 overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Product</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">SKU / Code</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Category</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Current Stock</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Status</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Update</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-table-body" class="divide-y divide-slate-100">
                            <!-- Rows injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('inventory-search').addEventListener('input', () => this.renderTable());
        document.getElementById('inventory-filter').addEventListener('change', () => this.renderTable());
    },

    render: function() {
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('inventory-table-body');
        if(!tbody) return;

        const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
        const filterStatus = document.getElementById('inventory-filter').value;
        const products = Store.getProducts();

        const filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                                  p.sku.toLowerCase().includes(searchTerm) ||
                                  p.code.toLowerCase().includes(searchTerm);
            
            let matchesFilter = true;
            if(filterStatus === 'low') matchesFilter = p.stock > 0 && p.stock <= 5;
            if(filterStatus === 'out') matchesFilter = p.stock <= 0;

            return matchesSearch && matchesFilter;
        });

        if(filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${UI.getEmptyState('fa-warehouse', 'No Inventory Found', 'Try adjusting your search or filters.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            let statusHtml = '';
            if(p.stock > 10) statusHtml = '<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">In Stock</span>';
            else if (p.stock > 0) statusHtml = '<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">Low Stock</span>';
            else statusHtml = '<span class="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>';

            return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                    <div class="font-semibold text-slate-800">${p.name}</div>
                    <div class="text-xs text-slate-500 mt-0.5">${p.size} | ${p.color}</div>
                </td>
                <td class="p-4">
                    <div class="text-sm font-medium text-slate-700">${p.sku}</div>
                    <div class="text-xs text-slate-400 mt-0.5">${p.code}</div>
                </td>
                <td class="p-4 text-sm text-slate-600">${p.category}</td>
                <td class="p-4 text-center">
                    <span class="text-lg font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-slate-700'}">${p.stock}</span>
                </td>
                <td class="p-4 text-center">${statusHtml}</td>
                <td class="p-4 text-center">
                    <button onclick="Inventory.quickUpdateStock('${p.id}')" class="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-rose-200 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <i class="fa-solid fa-plus-minus mr-1"></i> Update
                    </button>
                </td>
            </tr>
        `}).join('');
    },

    quickUpdateStock: function(id) {
        const product = Store.getProducts().find(p => p.id === id);
        if(!product) return;

        const html = `
            <div class="text-center">
                <h4 class="font-bold text-slate-800 mb-2">${product.name}</h4>
                <p class="text-sm text-slate-500 mb-4">Current Stock: <span class="font-bold text-slate-800">${product.stock}</span></p>
                <div class="flex items-center justify-center gap-4">
                    <input type="number" id="quick-stock-val" value="${product.stock}" min="0" class="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-rose-200 outline-none">
                </div>
            </div>
        `;

        UI.showModal('Update Stock', html, (modal) => {
            const newVal = parseInt(document.getElementById('quick-stock-val').value);
            if(!isNaN(newVal) && newVal >= 0) {
                product.stock = newVal;
                Store.updateProduct(product);
                UI.showToast('Stock updated successfully', 'success');
                this.renderTable();
                UI.closeModal(modal);
            }
        }, 'Update', 'Cancel', 'max-w-sm');
    }
};
