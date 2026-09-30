/**
 * Settings.js - Shop Settings Management
 */

const Settings = {
    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-settings');
        container.innerHTML = `
            <div class="max-w-4xl mx-auto py-6 h-full flex flex-col">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                    <div class="p-6 border-b border-slate-200 bg-slate-50/50">
                        <h2 class="text-xl font-bold text-slate-800">Shop Settings</h2>
                        <p class="text-sm text-slate-500 mt-1">Configure your shop details for invoices and system defaults.</p>
                    </div>

                    <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <form id="settings-form" class="space-y-6">
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-4">
                                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Basic Info</h3>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Shop Name *</label>
                                        <input type="text" id="set-name" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Phone Number *</label>
                                        <input type="text" id="set-phone" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">WhatsApp Number (with country code)</label>
                                        <input type="text" id="set-whatsapp" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none">
                                        <p class="text-[10px] text-slate-400 mt-1">Example: 919876543210 (No + sign)</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
                                        <input type="email" id="set-email" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">GST Number</label>
                                        <input type="text" id="set-gst" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none">
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Invoice Settings</h3>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Shop Address</label>
                                        <textarea id="set-address" rows="3" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Invoice Number Prefix</label>
                                        <input type="text" id="set-prefix" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Currency Symbol</label>
                                        <input type="text" id="set-currency" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none" value="₹">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-slate-600 mb-1">Invoice Footer Terms</label>
                                        <textarea id="set-footer" rows="2" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onclick="Settings.resetToDefault()" class="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors shadow-sm">
                            Reset to Defaults
                        </button>
                        <button type="button" onclick="Settings.saveSettings()" class="px-8 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition-colors shadow-sm shadow-rose-200">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    render: function() {
        const settings = Store.getSettings();
        document.getElementById('set-name').value = settings.shopName || '';
        document.getElementById('set-phone').value = settings.phone || '';
        document.getElementById('set-whatsapp').value = settings.whatsapp || '';
        document.getElementById('set-email').value = settings.email || '';
        document.getElementById('set-gst').value = settings.gstNumber || '';
        document.getElementById('set-address').value = settings.address || '';
        document.getElementById('set-prefix').value = settings.invoicePrefix || '';
        document.getElementById('set-currency').value = settings.currency || '₹';
        document.getElementById('set-footer').value = settings.invoiceFooter || '';
    },

    saveSettings: function() {
        const name = document.getElementById('set-name').value.trim();
        const phone = document.getElementById('set-phone').value.trim();

        if(!name || !phone) {
            UI.showToast('Shop Name and Phone are required', 'error');
            return;
        }

        const settings = {
            shopName: name,
            phone: phone,
            whatsapp: document.getElementById('set-whatsapp').value.trim(),
            email: document.getElementById('set-email').value.trim(),
            gstNumber: document.getElementById('set-gst').value.trim(),
            address: document.getElementById('set-address').value.trim(),
            invoicePrefix: document.getElementById('set-prefix').value.trim(),
            currency: document.getElementById('set-currency').value.trim() || '₹',
            invoiceFooter: document.getElementById('set-footer').value.trim()
        };

        Store.saveData('settings', settings);
        document.getElementById('sidebar-shop-name').textContent = settings.shopName.split(' ')[0] + ' POS';
        
        UI.showToast('Settings saved successfully', 'success');
    },

    resetToDefault: function() {
        if(confirm("Are you sure you want to reset settings to default?")) {
            Store.saveData('settings', Store.defaultSettings);
            this.render();
            UI.showToast('Settings reset to default', 'info');
        }
    }
};
