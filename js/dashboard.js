/**
 * Dashboard.js - Dashboard Stats and Charts
 */

const Dashboard = {
    salesChart: null,

    init: function() {
        this.renderLayout();
    },

    renderLayout: function() {
        const container = document.getElementById('page-dashboard');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Stat Cards -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div class="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">Today's Sales</p>
                        <h3 id="stat-sales" class="text-2xl font-bold text-slate-800">₹0</h3>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div class="w-14 h-14 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-file-invoice"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">Today's Bills</p>
                        <h3 id="stat-bills" class="text-2xl font-bold text-slate-800">0</h3>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div class="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">Low Stock Items</p>
                        <h3 id="stat-low-stock" class="text-2xl font-bold text-slate-800">0</h3>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div class="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Customers</p>
                        <h3 id="stat-customers" class="text-2xl font-bold text-slate-800">0</h3>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Chart Area -->
                <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-slate-800">Sales Overview</h3>
                        <select class="text-sm border-slate-200 rounded-lg outline-none text-slate-600 bg-slate-50 px-2 py-1">
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div class="h-72 w-full">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>

                <!-- Recent Bills -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-slate-800">Recent Bills</h3>
                        <button onclick="App.navigateTo('history')" class="text-sm text-primary hover:text-primaryHover font-medium">View All</button>
                    </div>
                    <div id="dash-recent-bills" class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        <!-- Injected via JS -->
                    </div>
                </div>
            </div>
        `;
    },

    render: function() {
        const invoices = Store.getInvoices();
        const products = Store.getProducts();
        const customers = Store.getCustomers();
        
        // Calculate Stats
        const today = new Date().toDateString();
        const todaysInvoices = invoices.filter(i => new Date(i.date).toDateString() === today && i.status !== 'Cancelled');
        
        const todaySales = todaysInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
        
        document.getElementById('stat-sales').textContent = `₹${todaySales.toFixed(2)}`;
        document.getElementById('stat-bills').textContent = todaysInvoices.length;
        document.getElementById('stat-low-stock').textContent = lowStock;
        document.getElementById('stat-customers').textContent = customers.length;

        // Render Recent Bills
        const recentBillsContainer = document.getElementById('dash-recent-bills');
        const recentInvoices = invoices.slice(0, 5);
        
        if (recentInvoices.length === 0) {
            recentBillsContainer.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm">No recent bills found.</div>`;
        } else {
            recentBillsContainer.innerHTML = recentInvoices.map(inv => `
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors cursor-pointer" onclick="History.viewInvoice('${inv.id}')">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-file-invoice"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-slate-800">${inv.invoiceNumber}</h4>
                            <p class="text-xs text-slate-500">${inv.customer.name}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-bold text-slate-800">₹${inv.grandTotal.toFixed(2)}</div>
                        <div class="text-[10px] font-medium text-emerald-600">${inv.paymentMethod}</div>
                    </div>
                </div>
            `).join('');
        }

        this.renderChart(invoices);
    },

    renderChart: function(invoices) {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        // Prepare last 7 days data
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dateString = d.toDateString();
            const dailyTotal = invoices
                .filter(inv => new Date(inv.date).toDateString() === dateString && inv.status !== 'Cancelled')
                .reduce((sum, inv) => sum + inv.grandTotal, 0);
            
            data.push(dailyTotal);
        }

        if (this.salesChart) {
            this.salesChart.destroy();
        }

        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales (₹)',
                    data: data,
                    borderColor: '#10b981', // emerald-500
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#10b981',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleFont: { family: 'Outfit', size: 13 },
                        bodyFont: { family: 'Outfit', size: 14, weight: 'bold' },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [4, 4], color: '#f1f5f9' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }
};
