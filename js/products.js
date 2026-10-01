/**
 * Products.js - Product Management Interface
 */

const Products = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-products');
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1 w-full relative">
                        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                        <input type="text" id="product-search" placeholder="Search products..." 
                            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all">
                    </div>
                    <button onclick="Products.showAddModal()" class="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                        <i class="fa-solid fa-plus"></i> Add Product
                    </button>
                </div>

                <!-- Table Container -->
                <div class="flex-1 overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 w-16">Image</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Product Details</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Category</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-right">Price</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-center">Stock</th>
                                <th class="p-4 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body" class="divide-y divide-slate-100">
                            <!-- Rows injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('product-search').addEventListener('input', () => this.renderTable());
    },

    render: function() {
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('products-table-body');
        if(!tbody) return;

        const searchTerm = document.getElementById('product-search').value.toLowerCase();
        const products = Store.getProducts();

        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.code.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm)
        );

        if(filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${UI.getEmptyState('fa-box-open', 'No Products Found', 'Try a different search or add a new product.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(p => `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="p-4">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}" class="w-full h-full object-cover object-top">
                    </div>
                </td>
                <td class="p-4">
                    <div class="font-semibold text-slate-800">${p.name}</div>
                    <div class="text-xs text-slate-500 mt-0.5">Code: ${p.code} | SKU: ${p.sku}</div>
                    <div class="text-xs text-slate-400 mt-0.5">Size: ${p.size} | Color: ${p.color}</div>
                </td>
                <td class="p-4">
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">${p.category}</span>
                </td>
                <td class="p-4 text-right">
                    <div class="font-bold text-slate-800">₹${p.price}</div>
                    ${p.discount > 0 ? `<div class="text-xs text-red-500 font-medium">-${p.discount}% Off</div>` : ''}
                </td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}">
                        ${p.stock}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick='Products.showEditModal(${JSON.stringify(p).replace(/'/g, "&#39;")})' class="w-8 h-8 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="Products.deleteProduct('${p.id}')" class="w-8 h-8 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showAddModal: function() {
        const html = this.getFormHtml();
        UI.showModal('Add New Product', html, (modal) => {
            if(this.saveForm(modal)) UI.closeModal(modal);
        }, 'Save Product');
    },

    showEditModal: function(product) {
        const html = this.getFormHtml(product);
        UI.showModal('Edit Product', html, (modal) => {
            if(this.saveForm(modal, product.id)) UI.closeModal(modal);
        }, 'Update Product');
    },

    getFormHtml: function(p = {}) {
        return `
            <form id="product-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                        <input type="text" id="pf-name" value="${p.name || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" required>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Product Code *</label>
                        <input type="text" id="pf-code" value="${p.code || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" required>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">SKU</label>
                        <input type="text" id="pf-sku" value="${p.sku || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                        <input type="text" id="pf-category" value="${p.category || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" required>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Size</label>
                        <input type="text" id="pf-size" value="${p.size || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Color</label>
                        <input type="text" id="pf-color" value="${p.color || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity *</label>
                        <input type="number" id="pf-stock" value="${p.stock !== undefined ? p.stock : 10}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" required min="0">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Price (₹) *</label>
                        <input type="number" id="pf-price" value="${p.price || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" required min="0" step="0.01">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
                        <input type="number" id="pf-discount" value="${p.discount || 0}" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" min="0" max="100">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Image URL</label>
                        <input type="text" id="pf-image" value="${p.image || ''}" placeholder="https://..." class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm">
                    </div>
                </div>
            </form>
        `;
    },

    saveForm: function(modal, id = null) {
        const name = document.getElementById('pf-name').value.trim();
        const code = document.getElementById('pf-code').value.trim();
        const price = parseFloat(document.getElementById('pf-price').value);
        const category = document.getElementById('pf-category').value.trim();
        const stock = parseInt(document.getElementById('pf-stock').value);

        if(!name || !code || isNaN(price) || !category || isNaN(stock)) {
            UI.showToast('Please fill all required fields', 'error');
            return false;
        }

        const product = {
            id: id,
            name,
            code,
            sku: document.getElementById('pf-sku').value.trim() || code,
            category,
            size: document.getElementById('pf-size').value.trim(),
            color: document.getElementById('pf-color').value.trim(),
            price,
            stock,
            discount: parseFloat(document.getElementById('pf-discount').value) || 0,
            image: document.getElementById('pf-image').value.trim() || 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=500&q=80'
        };

        if(id) {
            Store.updateProduct(product);
            UI.showToast('Product updated successfully', 'success');
        } else {
            Store.addProduct(product);
            UI.showToast('Product added successfully', 'success');
        }
        
        this.renderTable();
        return true;
    },

    deleteProduct: function(id) {
        const p = Store.getProducts().find(x => x.id === id);
        const html = `
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">Delete Product?</h3>
                <p class="text-sm text-slate-500">Are you sure you want to delete <b>${p.name}</b>? This action cannot be undone.</p>
            </div>
        `;
        
        UI.showModal('Confirm Delete', html, (modal) => {
            Store.deleteProduct(id);
            UI.showToast('Product deleted', 'info');
            this.renderTable();
            UI.closeModal(modal);
        }, 'Delete', 'Cancel', 'max-w-sm');
    }
};
