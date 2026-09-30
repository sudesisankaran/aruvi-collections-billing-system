/**
 * Store.js - Handles all LocalStorage interactions
 */

const Store = {
    // Initial sample products
    sampleProducts: [
        { id: '1', code: 'P001', sku: 'SKU-001', name: 'Floral Maxi Dress', category: 'Dresses', size: 'M', color: 'Blue', price: 1599, discount: 10, stock: 45, image: 'assets/images/floral_maxi_dress_1790783595068.jpg' },
        { id: '2', code: 'P002', sku: 'SKU-002', name: 'Designer Kurti', category: 'Ethnic', size: 'L', color: 'Yellow', price: 899, discount: 5, stock: 20, image: 'assets/images/designer_kurti_1790783616502.jpg' },
        { id: '3', code: 'P003', sku: 'SKU-003', name: 'Cotton Salwar Set', category: 'Ethnic', size: 'XL', color: 'Green', price: 1299, discount: 0, stock: 15, image: 'assets/images/salwar_set_1790783636002.jpg' },
        { id: '4', code: 'P004', sku: 'SKU-004', name: 'Anarkali Dress', category: 'Party Wear', size: 'M', color: 'Red', price: 2499, discount: 15, stock: 10, image: 'assets/images/lehenga_choli_1790783677656.jpg' },
        { id: '5', code: 'P005', sku: 'SKU-005', name: 'Western Midi Dress', category: 'Western', size: 'S', color: 'Black', price: 1199, discount: 0, stock: 30, image: 'assets/images/western_midi_1790783654367.jpg' },
        { id: '6', code: 'P006', sku: 'SKU-006', name: 'Co-ord Set', category: 'Western', size: 'M', color: 'Pink', price: 1499, discount: 5, stock: 25, image: 'assets/images/western_midi_1790783654367.jpg' },
        { id: '7', code: 'P007', sku: 'SKU-007', name: 'Party Wear Dress', category: 'Party Wear', size: 'L', color: 'Navy', price: 2999, discount: 20, stock: 8, image: 'assets/images/lehenga_choli_1790783677656.jpg' },
        { id: '8', code: 'P008', sku: 'SKU-008', name: 'Casual Top', category: 'Tops', size: 'S', color: 'White', price: 499, discount: 0, stock: 50, image: 'assets/images/designer_kurti_1790783616502.jpg' },
        { id: '9', code: 'P009', sku: 'SKU-009', name: 'Palazzo Set', category: 'Ethnic', size: 'L', color: 'Maroon', price: 1399, discount: 10, stock: 18, image: 'assets/images/salwar_set_1790783636002.jpg' },
        { id: '10', code: 'P010', sku: 'SKU-010', name: 'Lehenga Choli', category: 'Party Wear', size: 'Free Size', color: 'Peach', price: 4999, discount: 25, stock: 5, image: 'assets/images/lehenga_choli_1790783677656.jpg' }
    ],

    // Default Settings
    defaultSettings: {
        shopName: 'Aruvi Collection',
        phone: '+91 98765 43210',
        whatsapp: '919876543210',
        email: 'info@aruvicollection.com',
        address: '123 Fashion Street, Style City, SC 12345',
        gstNumber: 'GST1234567890',
        invoicePrefix: 'INV-2026-',
        invoiceFooter: 'Thank you for shopping with us! No return or exchange without original invoice.',
        currency: '₹'
    },

    init: function() {
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify(this.sampleProducts));
        } else {
            // Migration: Replace old unsplash images with new local AI images
            let existingProducts = JSON.parse(localStorage.getItem('products'));
            let updated = false;
            existingProducts = existingProducts.map(p => {
                if (p.image && p.image.includes('unsplash.com')) {
                    const sampleMatch = this.sampleProducts.find(sp => sp.code === p.code);
                    if (sampleMatch) {
                        p.image = sampleMatch.image;
                        updated = true;
                    }
                }
                return p;
            });
            if (updated) {
                localStorage.setItem('products', JSON.stringify(existingProducts));
            }
        }
        
        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify(this.defaultSettings));
        }
        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([]));
        }
        if (!localStorage.getItem('invoices')) {
            localStorage.setItem('invoices', JSON.stringify([]));
        }
        if (!localStorage.getItem('invoiceCounter')) {
            localStorage.setItem('invoiceCounter', '1');
        }
    },

    // Generic Methods
    getData: function(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    saveData: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Specific Getters
    getProducts: () => Store.getData('products'),
    getCustomers: () => Store.getData('customers'),
    getInvoices: () => Store.getData('invoices'),
    getSettings: () => {
        const settings = localStorage.getItem('settings');
        return settings ? JSON.parse(settings) : Store.defaultSettings;
    },
    
    // Add new data
    addProduct: function(product) {
        const products = this.getProducts();
        product.id = Date.now().toString();
        products.push(product);
        this.saveData('products', products);
        return product;
    },

    updateProduct: function(updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            products[index] = updatedProduct;
            this.saveData('products', products);
        }
    },

    deleteProduct: function(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.saveData('products', products);
    },

    // Customer operations
    addOrUpdateCustomer: function(customer) {
        const customers = this.getCustomers();
        const existingIndex = customers.findIndex(c => c.mobile === customer.mobile);
        
        if (existingIndex !== -1) {
            // Update
            customers[existingIndex] = { ...customers[existingIndex], ...customer };
            this.saveData('customers', customers);
            return customers[existingIndex];
        } else {
            // Add
            customer.id = Date.now().toString();
            customer.totalPurchases = customer.totalPurchases || 0;
            customer.numberOfBills = customer.numberOfBills || 0;
            customer.lastPurchase = customer.lastPurchase || new Date().toISOString();
            customers.push(customer);
            this.saveData('customers', customers);
            return customer;
        }
    },

    // Invoice operations
    generateInvoiceNumber: function() {
        const settings = this.getSettings();
        let counter = parseInt(localStorage.getItem('invoiceCounter') || '1');
        const numStr = counter.toString().padStart(5, '0');
        return `${settings.invoicePrefix}${numStr}`;
    },

    saveInvoice: function(invoiceData) {
        const invoices = this.getInvoices();
        
        // Generate final invoice number
        invoiceData.invoiceNumber = this.generateInvoiceNumber();
        invoiceData.id = Date.now().toString();
        invoiceData.date = new Date().toISOString();
        
        invoices.unshift(invoiceData); // Add to beginning
        this.saveData('invoices', invoices);

        // Increment counter
        let counter = parseInt(localStorage.getItem('invoiceCounter') || '1');
        localStorage.setItem('invoiceCounter', (counter + 1).toString());

        // Update Inventory
        this.updateInventory(invoiceData.items, 'decrease');

        // Update Customer Stats
        if(invoiceData.customer && invoiceData.customer.mobile) {
            const customer = this.getCustomers().find(c => c.mobile === invoiceData.customer.mobile);
            if(customer) {
                customer.totalPurchases += invoiceData.grandTotal;
                customer.numberOfBills += 1;
                customer.lastPurchase = invoiceData.date;
                this.addOrUpdateCustomer(customer);
            }
        }

        return invoiceData;
    },

    cancelInvoice: function(invoiceId) {
        const invoices = this.getInvoices();
        const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
        
        if (invoiceIndex !== -1 && invoices[invoiceIndex].status !== 'Cancelled') {
            invoices[invoiceIndex].status = 'Cancelled';
            this.saveData('invoices', invoices);
            
            // Restore inventory
            this.updateInventory(invoices[invoiceIndex].items, 'increase');
            
            return true;
        }
        return false;
    },

    updateInventory: function(items, action = 'decrease') {
        const products = this.getProducts();
        items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                if (action === 'decrease') {
                    product.stock = Math.max(0, product.stock - item.quantity);
                } else {
                    product.stock = product.stock + item.quantity;
                }
            }
        });
        this.saveData('products', products);
    }
};

// Initialize Store
Store.init();
