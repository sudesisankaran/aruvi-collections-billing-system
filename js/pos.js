/**
 * POS.js - Point of Sale Billing Logic
 */

const POS = {
    cart: [],
    customer: { name: '', mobile: '', address: '' },
    taxRate: 0, // Assume tax is included or 0 for simplicity, can be changed.
    
    init: function() {
        this.renderLayout();
        this.bindEvents();
    },

    renderLayout: function() {
        const container = document.getElementById('page-pos');
        container.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-6 h-full p-4 lg:p-6 pb-20 lg:pb-6 bg-slate-100/50">
                
                <!-- Left Side: Products -->
                <div class="w-full lg:w-7/12 xl:w-2/3 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <!-- Search Header -->
                    <div class="p-4 border-b border-slate-100 bg-white z-10 flex flex-col md:flex-row gap-3">
                        <div class="relative w-full md:flex-1">
                            <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                            <input type="text" id="pos-search" placeholder="Scan barcode or search name/SKU... (Press Enter to add)" 
                                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-primary transition-all outline-none">
                        </div>
                        <div class="flex gap-3 w-full md:w-auto">
                            <select id="pos-category-filter" class="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-medium text-slate-600">
                                <option value="All">All Categories</option>
                                <!-- Options injected dynamically -->
                            </select>
                            <button onclick="POS.showCustomItemModal()" class="flex-1 md:w-auto px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium whitespace-nowrap shadow-sm">
                                <i class="fa-solid fa-plus mr-1"></i> Custom Item
                            </button>
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <div id="pos-products-grid" class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 custom-scrollbar bg-slate-50/50">
                        <!-- Product Cards -->
                    </div>
                </div>

                <!-- Right Side: Cart & Checkout -->
                <div class="w-full lg:w-5/12 xl:w-1/3 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    
                    <!-- Customer Selection -->
                    <div class="p-4 border-b border-slate-100 bg-emerald-50/30">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                                <i class="fa-solid fa-user text-primary"></i> Customer Details
                            </h3>
                            <button id="btn-clear-customer" class="text-xs text-emerald-500 hover:text-emerald-700 hidden">Clear</button>
                        </div>
                        
                        <div class="space-y-3">
                            <div class="relative">
                                <input type="text" id="pos-customer-mobile" placeholder="Mobile Number *" maxlength="10"
                                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none">
                                <button id="btn-search-customer" class="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-primary transition-colors">
                                    <i class="fa-solid fa-search"></i>
                                </button>
                            </div>
                            <input type="text" id="pos-customer-name" placeholder="Customer Name *" 
                                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none">
                        </div>
                    </div>

                    <!-- Cart Header -->
                    <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-sm font-semibold text-slate-600">
                        <span class="w-2/5">Item</span>
                        <span class="w-1/5 text-center">Qty</span>
                        <span class="w-1/5 text-right">Price</span>
                        <span class="w-1/5 text-right">Total</span>
                    </div>

                    <!-- Cart Items -->
                    <div id="pos-cart-items" class="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white">
                        <!-- Items injected here -->
                    </div>

                    <!-- Cart Footer / Calculation -->
                    <div class="bg-slate-50 border-t border-slate-200 p-4">
                        <div class="space-y-2 mb-4 text-sm">
                            <div class="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span id="pos-subtotal" class="font-medium">₹0.00</span>
                            </div>
                            <div class="flex justify-between text-emerald-600">
                                <span>Item Discounts</span>
                                <span id="pos-item-discount" class="font-medium">-₹0.00</span>
                            </div>
                            <div class="flex justify-between items-center text-emerald-600 mt-1">
                                <span>Extra Discount (₹)</span>
                                <input type="number" id="pos-extra-discount" value="0" min="0" class="w-20 px-2 py-1 text-right bg-white border border-emerald-200 rounded-lg text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all">
                            </div>
                            <div class="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                                <span class="text-base font-bold text-slate-800">Grand Total</span>
                                <span id="pos-total" class="text-2xl font-bold text-primary">₹0.00</span>
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <div class="grid grid-cols-3 gap-2 mb-4">
                            <button class="payment-method-btn active py-2 border border-emerald-200 bg-emerald-50 text-primary rounded-lg text-sm font-medium transition-colors" data-method="Cash">
                                <i class="fa-solid fa-money-bill-wave mb-1 block"></i> Cash
                            </button>
                            <button class="payment-method-btn py-2 border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-primary rounded-lg text-sm font-medium transition-colors" data-method="UPI">
                                <i class="fa-solid fa-qrcode mb-1 block"></i> UPI
                            </button>
                            <button class="payment-method-btn py-2 border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-primary rounded-lg text-sm font-medium transition-colors" data-method="Card">
                                <i class="fa-solid fa-credit-card mb-1 block"></i> Card
                            </button>
                        </div>

                        <button id="btn-generate-bill" class="w-full bg-primary hover:bg-primaryHover text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                            GENERATE BILL
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents: function() {
        // Search & Filter
        const searchInput = document.getElementById('pos-search');
        const catFilter = document.getElementById('pos-category-filter');
        
        if(searchInput) {
            searchInput.addEventListener('input', () => this.renderProducts());
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleBarcodeScan(searchInput.value.trim());
                }
            });
        }
        if(catFilter) catFilter.addEventListener('change', () => this.renderProducts());

        // Payment Methods
        const paymentBtns = document.querySelectorAll('.payment-method-btn');
        paymentBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                paymentBtns.forEach(b => {
                    b.classList.remove('active', 'bg-emerald-50', 'border-emerald-200', 'text-primary');
                    b.classList.add('bg-white', 'border-slate-200', 'text-slate-600');
                });
                const target = e.currentTarget;
                target.classList.remove('bg-white', 'border-slate-200', 'text-slate-600');
                target.classList.add('active', 'bg-emerald-50', 'border-emerald-200', 'text-primary');
            });
        });

        // Customer Search
        const searchCustomerBtn = document.getElementById('btn-search-customer');
        const mobileInput = document.getElementById('pos-customer-mobile');
        
        if(searchCustomerBtn) {
            searchCustomerBtn.addEventListener('click', () => {
                const mobile = mobileInput.value.trim();
                if(mobile.length === 10) {
                    const customers = Store.getCustomers();
                    const cust = customers.find(c => c.mobile === mobile);
                    if(cust) {
                        document.getElementById('pos-customer-name').value = cust.name;
                        UI.showToast('Customer found!', 'success');
                    } else {
                        UI.showToast('Customer not found. New customer.', 'info');
                    }
                }
            });
        }

        if(mobileInput) {
            mobileInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        // Extra Discount
        const extraDiscountInput = document.getElementById('pos-extra-discount');
        if (extraDiscountInput) {
            extraDiscountInput.addEventListener('input', () => this.calculateTotals());
            extraDiscountInput.addEventListener('focus', function() { if(this.value==='0') this.value=''; });
            extraDiscountInput.addEventListener('blur', function() { if(this.value==='') this.value='0'; });
        }

        // Generate Bill
        const genBtn = document.getElementById('btn-generate-bill');
        if(genBtn) {
            genBtn.addEventListener('click', () => this.generateBill());
        }
    },

    renderProducts: function() {
        const grid = document.getElementById('pos-products-grid');
        const filterCat = document.getElementById('pos-category-filter');
        if(!grid) return;

        const products = Store.getProducts();
        const searchTerm = document.getElementById('pos-search').value.toLowerCase();
        const category = filterCat ? filterCat.value : 'All';

        // Update Categories in dropdown if empty
        if(filterCat && filterCat.options.length <= 1) {
            const categories = [...new Set(products.map(p => p.category))];
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                filterCat.appendChild(opt);
            });
        }

        const filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                                  p.code.toLowerCase().includes(searchTerm) || 
                                  p.sku.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'All' || p.category === category;
            return matchesSearch && matchesCategory;
        });

        if(filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full">${UI.getEmptyState('fa-box-open', 'No Products Found', 'Try a different search term.')}</div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const isOutOfStock = p.stock <= 0;
            return `
            <div class="product-card bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer flex flex-col ${isOutOfStock ? 'opacity-60 grayscale' : ''}"
                 onclick="${isOutOfStock ? '' : `POS.addToCart('${p.id}')`}">
                <div class="aspect-[4/5] bg-slate-100 relative overflow-hidden group">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500">
                    ${p.discount > 0 ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">- ${p.discount}%</div>` : ''}
                    ${isOutOfStock ? `<div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center"><span class="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span></div>` : ''}
                </div>
                <div class="p-3 flex flex-col flex-1">
                    <div class="text-xs text-slate-400 mb-1 flex justify-between">
                        <span>${p.code}</span>
                        <span>Stock: ${p.stock}</span>
                    </div>
                    <h4 class="text-sm font-semibold text-slate-800 leading-tight mb-1 truncate">${p.name}</h4>
                    <div class="text-xs text-slate-500 mb-2">Size: ${p.size} | Color: ${p.color}</div>
                    <div class="mt-auto flex justify-between items-center">
                        <div class="font-bold text-primary">₹${p.price}</div>
                    </div>
                </div>
            </div>
        `}).join('');
    },

    addToCart: function(productId) {
        const product = Store.getProducts().find(p => p.id === productId);
        if(!product) return;

        if(product.stock <= 0) {
            UI.showToast('Product is out of stock!', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if(existingItem) {
            if(existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
                UI.showToast('Cart updated', 'info');
            } else {
                UI.showToast('Maximum stock limit reached', 'warning');
            }
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
            // Small subtle sound could go here
            UI.showToast(`${product.name} added to cart`, 'success');
        }

        this.updateCartUI();
    },

    updateCartItemQuantity: function(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        const product = Store.getProducts().find(p => p.id === productId);
        
        if(item) {
            const newQty = item.quantity + delta;
            if(newQty > 0 && newQty <= product.stock) {
                item.quantity = newQty;
            } else if (newQty > product.stock) {
                UI.showToast('Maximum stock limit reached', 'warning');
            } else if (newQty === 0) {
                this.cart = this.cart.filter(i => i.id !== productId);
            }
            this.updateCartUI();
        }
    },

    removeFromCart: function(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.updateCartUI();
    },

    clearCart: function() {
        this.cart = [];
        document.getElementById('pos-customer-mobile').value = '';
        document.getElementById('pos-customer-name').value = '';
        
        const extraDiscountInput = document.getElementById('pos-extra-discount');
        if(extraDiscountInput) extraDiscountInput.value = '0';
        
        this.updateCartUI();
    },

    updateCartUI: function() {
        const container = document.getElementById('pos-cart-items');
        if(!container) return;

        if(this.cart.length === 0) {
            container.innerHTML = `<div class="h-full flex items-center justify-center">${UI.getEmptyState('fa-shopping-cart', 'Cart is Empty', 'Add products from the left panel.')}</div>`;
            this.calculateTotals();
            return;
        }

        container.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
            const finalItemTotal = itemTotal - itemDiscount;

            return `
            <div class="flex items-center justify-between p-3 mb-2 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors group gap-2">
                <!-- Item Info -->
                <div class="flex-1 pr-2 min-w-0">
                    <h5 class="text-sm font-semibold text-slate-800 leading-tight truncate">${item.name}</h5>
                    <div class="text-[11px] text-slate-500 mt-0.5">${item.size} | ${item.color}</div>
                    ${item.discount > 0 ? `<div class="text-[10px] text-red-500 font-medium">-${item.discount}% Off</div>` : ''}
                </div>
                
                <!-- Qty Control -->
                <div class="flex items-center justify-center gap-1 shrink-0">
                    <button onclick="POS.updateCartItemQuantity('${item.id}', -1)" class="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors">
                        <i class="fa-solid fa-minus text-[10px]"></i>
                    </button>
                    <span class="w-6 text-center text-sm font-medium text-slate-700">${item.quantity}</span>
                    <button onclick="POS.updateCartItemQuantity('${item.id}', 1)" class="w-6 h-6 rounded bg-primary text-white flex items-center justify-center hover:bg-primaryHover transition-colors">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                    </button>
                </div>

                <!-- Price -->
                <div class="text-right text-sm text-slate-600 shrink-0 w-16">
                    ₹${item.price}
                </div>

                <!-- Total & Remove -->
                <div class="text-right flex items-center justify-end gap-2 shrink-0 min-w-[70px]">
                    <span class="text-sm font-bold text-slate-800">₹${finalItemTotal.toFixed(2)}</span>
                    <button onclick="POS.removeFromCart('${item.id}')" class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-1">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `}).join('');

        this.calculateTotals();
    },

    calculateTotals: function() {
        let subtotal = 0;
        let itemDiscountTotal = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const discountAmt = (itemTotal * (item.discount || 0)) / 100;
            
            subtotal += itemTotal;
            itemDiscountTotal += discountAmt;
        });

        const extraDiscountInput = document.getElementById('pos-extra-discount');
        const extraDiscount = extraDiscountInput ? (parseFloat(extraDiscountInput.value) || 0) : 0;
        
        const totalDiscount = itemDiscountTotal + extraDiscount;
        const grandTotal = Math.max(0, subtotal - totalDiscount);

        document.getElementById('pos-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        
        const itemDiscountEl = document.getElementById('pos-item-discount');
        if(itemDiscountEl) itemDiscountEl.textContent = `-₹${itemDiscountTotal.toFixed(2)}`;
        
        document.getElementById('pos-total').textContent = `₹${grandTotal.toFixed(2)}`;
        
        const btnGen = document.getElementById('btn-generate-bill');
        if(btnGen) {
            btnGen.disabled = this.cart.length === 0;
        }

        return { subtotal, totalDiscount, grandTotal };
    },

    generateBill: function() {
        if(this.cart.length === 0) {
            UI.showToast('Cart is empty', 'error');
            return;
        }

        const mobile = document.getElementById('pos-customer-mobile').value.trim();
        const name = document.getElementById('pos-customer-name').value.trim();

        if(!mobile || mobile.length < 10) {
            UI.showToast('Please enter a valid 10-digit mobile number', 'error');
            document.getElementById('pos-customer-mobile').focus();
            return;
        }
        if(!name) {
            UI.showToast('Please enter customer name', 'error');
            document.getElementById('pos-customer-name').focus();
            return;
        }

        const activePaymentBtn = document.querySelector('.payment-method-btn.active');
        const paymentMethod = activePaymentBtn ? activePaymentBtn.getAttribute('data-method') : 'Cash';

        const totals = this.calculateTotals();

        const invoiceData = {
            customer: { name, mobile },
            items: [...this.cart],
            subtotal: totals.subtotal,
            discount: totals.totalDiscount,
            grandTotal: totals.grandTotal,
            paymentMethod: paymentMethod,
            paymentStatus: 'Paid',
            status: 'Completed'
        };

        // Save Customer
        Store.addOrUpdateCustomer({ name, mobile });

        // Save Invoice & Update Inventory
        const savedInvoice = Store.saveInvoice(invoiceData);

        UI.showToast('Bill Generated Successfully!', 'success');
        
        // Show Success Screen
        this.showSuccessScreen(savedInvoice);
    },

    showSuccessScreen: function(invoice) {
        const modalHtml = `
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-4 border-white shadow-md">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 mb-1">Bill Generated!</h2>
                <p class="text-slate-500 mb-6">${invoice.invoiceNumber}</p>
                
                <div class="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2 border border-slate-100">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Customer:</span>
                        <span class="font-medium text-slate-800">${invoice.customer.name}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Amount:</span>
                        <span class="font-bold text-primary text-lg">₹${invoice.grandTotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Payment:</span>
                        <span class="font-medium text-slate-800">${invoice.paymentMethod}</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <button onclick="History.generatePDF('${invoice.id}', true)" class="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                        <i class="fa-solid fa-file-pdf text-emerald-500 text-xl"></i>
                        Download PDF
                    </button>
                    <button onclick="POS.sendWhatsApp('${invoice.id}')" class="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 transition-colors text-slate-700 font-medium">
                        <i class="fa-brands fa-whatsapp text-emerald-500 text-xl"></i>
                        WhatsApp
                    </button>
                    <button onclick="POS.printBill('${invoice.id}')" class="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                        <i class="fa-solid fa-print text-slate-500 text-xl"></i>
                        Print Bill
                    </button>
                    <button onclick="UI.closeModal(this); POS.clearCart(); App.navigateTo('pos');" class="flex flex-col items-center justify-center gap-2 p-3 bg-primary text-white rounded-xl hover:bg-primaryHover transition-colors font-medium">
                        <i class="fa-solid fa-plus text-xl"></i>
                        New Bill
                    </button>
                </div>
            </div>
        `;
        
        UI.showModal('Success', modalHtml, null, '', '', 'max-w-sm');
    },

    sendWhatsApp: function(invoiceId) {
        const invoices = Store.getInvoices();
        const invoice = invoices.find(i => i.id === invoiceId);
        const settings = Store.getSettings();

        if(invoice && invoice.customer.mobile) {
            const text = `Hello ${invoice.customer.name},%0a%0aThank you for shopping with ${settings.shopName}.%0a%0aInvoice No: ${invoice.invoiceNumber}%0aTotal Amount: ${settings.currency}${invoice.grandTotal.toFixed(2)}%0aPayment Status: Paid%0a%0aThank you for shopping with us!`;
            const url = `https://wa.me/91${invoice.customer.mobile}?text=${text}`;
            window.open(url, '_blank');
        } else {
            UI.showToast('Customer mobile number not found', 'error');
        }
    },
    
    printBill: function(invoiceId) {
        History.generatePDF(invoiceId, false, true);
    },

    handleBarcodeScan: function(searchTerm) {
        if (!searchTerm) return;
        const products = Store.getProducts();
        // Exact match for code or sku
        const matched = products.find(p => p.code.toLowerCase() === searchTerm.toLowerCase() || p.sku.toLowerCase() === searchTerm.toLowerCase());
        
        if (matched) {
            this.addToCart(matched.id);
            document.getElementById('pos-search').value = '';
            this.renderProducts();
        } else {
            UI.showToast('Product not found in inventory', 'warning');
        }
    },

    showCustomItemModal: function() {
        const html = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Item Name *</label>
                    <input type="text" id="custom-item-name" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" placeholder="e.g. Alteration Charge" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Price (₹) *</label>
                        <input type="number" id="custom-item-price" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" min="0" step="0.01" required>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Quantity *</label>
                        <input type="number" id="custom-item-qty" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-sm" value="1" min="1" required>
                    </div>
                </div>
            </div>
        `;

        UI.showModal('Add Custom Item', html, (modal) => {
            const name = document.getElementById('custom-item-name').value.trim();
            const price = parseFloat(document.getElementById('custom-item-price').value);
            const qty = parseInt(document.getElementById('custom-item-qty').value);

            if (!name || isNaN(price) || isNaN(qty) || price < 0 || qty < 1) {
                UI.showToast('Please enter valid details', 'error');
                return;
            }

            this.addCustomItem(name, price, qty);
            UI.closeModal(modal);
        }, 'Add to Cart', 'Cancel', 'max-w-sm');
    },

    addCustomItem: function(name, price, qty) {
        const customId = 'CUSTOM_' + Date.now();
        this.cart.push({
            id: customId,
            name: name,
            code: 'CUSTOM',
            sku: 'N/A',
            category: 'Custom',
            size: '-',
            color: '-',
            price: price,
            stock: 999, // infinite for custom items
            discount: 0,
            quantity: qty
        });
        
        UI.showToast(`${name} added to cart`, 'success');
        this.updateCartUI();
    }
};
