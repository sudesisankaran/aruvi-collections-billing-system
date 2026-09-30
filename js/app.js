/**
 * App.js - Main Application Logic & Routing
 */

const App = {
    init: function() {
        this.bindEvents();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Initialize other modules FIRST
        if(typeof POS !== 'undefined') POS.init();
        if(typeof Products !== 'undefined') Products.init();
        if(typeof Customers !== 'undefined') Customers.init();
        if(typeof History !== 'undefined') History.init();
        if(typeof Settings !== 'undefined') Settings.init();
        if(typeof Dashboard !== 'undefined') Dashboard.init();
        if(typeof Inventory !== 'undefined') Inventory.init();
        if(typeof Returns !== 'undefined') Returns.init();
        if(typeof Reports !== 'undefined') Reports.init();
        
        // Load initial page (Dashboard)
        this.navigateTo('dashboard');
        
        // Set shop name
        const settings = Store.getSettings();
        document.getElementById('sidebar-shop-name').textContent = settings.shopName.split(' ')[0] + ' POS';
    },

    bindEvents: function() {
        // Navigation Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                this.navigateTo(page);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                    this.toggleSidebar(false);
                }
            });
        });

        // Sidebar Toggle
        const openBtn = document.getElementById('open-sidebar');
        const closeBtn = document.getElementById('close-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if(openBtn) openBtn.addEventListener('click', () => this.toggleSidebar(true));
        if(closeBtn) closeBtn.addEventListener('click', () => this.toggleSidebar(false));
        if(overlay) overlay.addEventListener('click', () => this.toggleSidebar(false));

        // Global New Sale Button
        const btnNewSale = document.getElementById('btn-new-sale');
        if(btnNewSale) {
            btnNewSale.addEventListener('click', () => {
                this.navigateTo('pos');
                if(typeof POS !== 'undefined') POS.clearCart();
            });
        }
    },

    navigateTo: function(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active-page');
        });

        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });

        // Show target page
        const targetPage = document.getElementById(`page-${pageId}`);
        if(targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active-page');
        }

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'pos': 'POS Billing',
            'products': 'Product Management',
            'inventory': 'Inventory',
            'customers': 'Customers',
            'history': 'Billing History',
            'returns': 'Returns & Cancellations',
            'reports': 'Reports & Analytics',
            'settings': 'Shop Settings'
        };
        
        document.getElementById('page-title').textContent = titles[pageId] || 'Aruvi POS';

        // Trigger specific render functions if needed
        if (pageId === 'dashboard' && typeof Dashboard !== 'undefined') Dashboard.render();
        if (pageId === 'pos' && typeof POS !== 'undefined') POS.renderProducts();
        if (pageId === 'products' && typeof Products !== 'undefined') Products.render();
        if (pageId === 'inventory' && typeof Inventory !== 'undefined') Inventory.render();
        if (pageId === 'customers' && typeof Customers !== 'undefined') Customers.render();
        if (pageId === 'history' && typeof History !== 'undefined') History.render();
        if (pageId === 'returns' && typeof Returns !== 'undefined') Returns.render();
        if (pageId === 'reports' && typeof Reports !== 'undefined') Reports.render();
        if (pageId === 'settings' && typeof Settings !== 'undefined') Settings.render();
    },

    toggleSidebar: function(show) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            // Small delay for fade in
            setTimeout(() => overlay.classList.add('opacity-100'), 10);
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.remove('opacity-100');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    },

    updateTime: function() {
        const timeEl = document.getElementById('current-time');
        if(timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            });
        }
    }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
