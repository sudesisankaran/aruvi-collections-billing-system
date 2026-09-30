/**
 * Reports.js - Sales Reports and Analytics
 */

const Reports = {
    charts: {},

    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-reports');
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p class="text-sm font-medium text-slate-500 mb-1">Today's Sales</p>
                        <h3 id="rep-today-sales" class="text-2xl font-bold text-slate-800">₹0</h3>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p class="text-sm font-medium text-slate-500 mb-1">Weekly Sales</p>
                        <h3 id="rep-week-sales" class="text-2xl font-bold text-slate-800">₹0</h3>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p class="text-sm font-medium text-slate-500 mb-1">Monthly Sales</p>
                        <h3 id="rep-month-sales" class="text-2xl font-bold text-slate-800">₹0</h3>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p class="text-sm font-medium text-slate-500 mb-1">Total Discounts Given</p>
                        <h3 id="rep-total-discounts" class="text-2xl font-bold text-emerald-600">₹0</h3>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Category Sales Chart -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Sales by Category</h3>
                        <div class="h-64">
                            <canvas id="chart-category"></canvas>
                        </div>
                    </div>

                    <!-- Payment Methods Chart -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Payment Methods</h3>
                        <div class="h-64">
                            <canvas id="chart-payment"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Selling Products -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-slate-800">Top Selling Products</h3>
                        <button onclick="window.print()" class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors hidden sm:block">
                            <i class="fa-solid fa-print mr-1"></i> Print Report
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                                    <th class="p-3 text-xs font-semibold text-slate-500 uppercase text-center">Qty Sold</th>
                                    <th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody id="rep-top-products" class="divide-y divide-slate-100">
                                <!-- Injected by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    render: function() {
        const invoices = Store.getInvoices().filter(i => i.status !== 'Cancelled');
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

        let todaySales = 0, weekSales = 0, monthSales = 0, totalDiscounts = 0;
        let categorySales = {};
        let paymentMethods = { 'Cash': 0, 'UPI': 0, 'Card': 0 };
        let productSales = {};

        invoices.forEach(inv => {
            const invDate = new Date(inv.date);
            
            if(invDate >= today) todaySales += inv.grandTotal;
            if(invDate >= weekAgo) weekSales += inv.grandTotal;
            if(invDate >= monthAgo) monthSales += inv.grandTotal;
            
            totalDiscounts += inv.discount;

            if(paymentMethods[inv.paymentMethod] !== undefined) {
                paymentMethods[inv.paymentMethod] += inv.grandTotal;
            }

            inv.items.forEach(item => {
                // Category
                if(!categorySales[item.category]) categorySales[item.category] = 0;
                categorySales[item.category] += (item.price * item.quantity);

                // Products
                if(!productSales[item.id]) {
                    productSales[item.id] = { name: item.name, category: item.category, qty: 0, revenue: 0 };
                }
                productSales[item.id].qty += item.quantity;
                productSales[item.id].revenue += (item.price * item.quantity);
            });
        });

        // Update Summary Cards
        document.getElementById('rep-today-sales').textContent = `₹${todaySales.toFixed(2)}`;
        document.getElementById('rep-week-sales').textContent = `₹${weekSales.toFixed(2)}`;
        document.getElementById('rep-month-sales').textContent = `₹${monthSales.toFixed(2)}`;
        document.getElementById('rep-total-discounts').textContent = `₹${totalDiscounts.toFixed(2)}`;

        // Render Top Products
        const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const tbody = document.getElementById('rep-top-products');
        
        if(sortedProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-slate-500 text-sm">No sales data available.</td></tr>`;
        } else {
            tbody.innerHTML = sortedProducts.map(p => `
                <tr class="hover:bg-slate-50">
                    <td class="p-3 font-medium text-slate-800">${p.name}</td>
                    <td class="p-3 text-sm text-slate-600">${p.category}</td>
                    <td class="p-3 text-sm font-bold text-slate-700 text-center">${p.qty}</td>
                    <td class="p-3 text-sm font-bold text-primary text-right">₹${p.revenue.toFixed(2)}</td>
                </tr>
            `).join('');
        }

        this.renderCharts(categorySales, paymentMethods);
    },

    renderCharts: function(catSales, payMethods) {
        // Category Chart
        const catCtx = document.getElementById('chart-category');
        if(catCtx) {
            if(this.charts.cat) this.charts.cat.destroy();
            this.charts.cat = new Chart(catCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catSales).length > 0 ? Object.keys(catSales) : ['No Data'],
                    datasets: [{
                        data: Object.keys(catSales).length > 0 ? Object.values(catSales) : [1],
                        backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#cbd5e1'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }

        // Payment Chart
        const payCtx = document.getElementById('chart-payment');
        if(payCtx) {
            if(this.charts.pay) this.charts.pay.destroy();
            this.charts.pay = new Chart(payCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(payMethods),
                    datasets: [{
                        label: 'Amount Received (₹)',
                        data: Object.values(payMethods),
                        backgroundColor: ['#f43f5e', '#3b82f6', '#10b981'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }
};
