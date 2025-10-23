// Dashboard Analytics Configuration and updating functions for revenue and products info.

async function loadDashboardAnalytics() {
  const timestamp = Date.now();
  
  try {
    // 1.Fetch analytics from server
    const response = await fetch(`db/dashboard_analytics.php?t=${timestamp}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    // Update daily sales
    displayDailySales(data.daily_sales);
    
    // Update daily sales chart
    displayDailySalesChart(data.chart_data, data.today_orders, data.daily_sales);
    
    // Update top5 products chart
    displayTop5Products(data.top_products);
    
  } catch(err) {
    console.error('Failed loading analytics', err);
    
    // Fallback UI output
    displayDailySalesError();
    displayTop5ProductsError();
    displayDailySalesChartError();
  }
}

function displayDailySales(salesAmount) {
  const element = document.getElementById('dailySalesAmount');
  if (!element) { console.warn('Sales element not found'); return; }
  
  element.textContent = `₱${salesAmount.toFixed(2)}`;
}

function displayDailySalesError() {
  const element = document.getElementById('dailySalesAmount');
  if (!element) return;
  
  element.textContent = '₱0'; // Default for error case
}

function displayTop5Products(products) {
  const barElement = document.getElementById('bar-chart');
  const listElement = document.getElementById('topProductsList');
  
  if(!barElement || !listElement) { 
    console.warn('Top products elements not found'); 
    return; 
  }
  
  // Hide bar chart text title only on list visibility
  listElement.style.display='block';
  
  const ul_el = listElement.querySelector('#topProductsDisplay .top-products-content ul');
  if (!ul_el) return;
  
  if(products.length === 0) {
    ul_el.innerHTML = '<p style="color:#6b7280; padding: 2rem; text-align:center;">No orders yet today.</p>';
    return;
  }
  
  // Clear first, re-fill with products
  ul_el.innerHTML = '';
  products.forEach( (p, idx) => {
    const li = document.createElement('li');
    li.className = 'top-product-item flex-between p-1 fs-0 mb-1';
    li.style.cssText = `
       padding: 0.5rem 0.75rem; 
       background: white; 
       border-left: 3px solid var(--brown); 
       border-radius: 3px; 
       display:flex; 
       justify-content: space-between; 
       align-items:center;
       margin-bottom: 0.5rem; 
       font-size: 0.875rem;
    `;
    
    // Name — quantity/order count
    const lDiv = document.createElement('div');
    lDiv.style.flex='1';
    lDiv.innerHTML = `<span class="fw-600">${p.name}<span><br><small style="color: #6b7280;font-size: 0.75rem">${p.quantity} units • ${p.count} orders</small></span></span>`;
    
    // Position #
    const rDiv = document.createElement('div');
    rDiv.className='fw-bold ml-1 fs-0';
    rDiv.style.cssText='color: var(--brown); font-size: 0.75rem;';
    rDiv.textContent=`#${idx+1}`;
    
    li.append(lDiv);
    li.append(rDiv);
    ul_el.append(li);
  } );
}

function displayTop5ProductsError() {
  const element = document.getElementById('bar-chart');
  const fallbackEl = document.getElementById('topProductsList');
  
  if(!element || !fallbackEl) return;
  fallbackEl.style.display='block';
  
  const listContainer = fallbackEl.querySelector('#topProductsDisplay .top-products-content ul');
  if (listContainer) {
    listContainer.innerHTML = `<p style="padding: 2rem; text-align:center; color: #6b7280;">Unable to load top products.</p>`;
  }
}

// Enhanced Daily Sales Chart visualization 
function displayDailySalesChart(chartData, todayOrdersCount, data) {
  const loadingEl = document.querySelector('.sales-chart-loading');
  const contentEl = document.querySelector('.sales-chart-content');
  const summaryEl = document.querySelector('.sales-chart-summary');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';
  
  const ordersEl = document.getElementById('todayOrdersCount');
  const revenueEl = document.getElementById('todayRevenue');
  
  if (ordersEl) ordersEl.textContent = `${todayOrdersCount || 0}`;
  if (revenueEl) revenueEl.textContent = `₱${((data?.daily_sales || 0)).toFixed(2)}`;
  
  // Improved chart container rendering
  const container = document.getElementById('salesCanvas');
  if (!container) return;
  
  // Use Chart.js-like design without requiring dependency
  if (chartData && chartData.length > 0) {
    const barChart = renderDailySalesChart(chartData);
    container.innerHTML = barChart;
  } else {
    container.innerHTML = '<div class="chart-placeholder">No sales data available yet</div>';
  }
}

function renderDailySalesChart(chartData){
  const maxRevenue = Math.max(...chartData.map(d => d.revenue)) || 1; // avoid /0
  
  return `
    <div style="padding:20px;font-family:'Fredoka',sans-serif;">
      <h3 style="color:#7f5539;font-size:16px; margin-bottom:15px;">📊 7-Day Revenue Trend</h3>
      <div style="display:flex;height:200px;align-items:flex-end;gap:8px;">
        ${chartData.map(day => {
          const height = `${Math.max(2, (day.revenue/maxRevenue) * 140)}px`;
          return `<div style="flex:1; background:linear-gradient(to bottom,#7f5539, #9c6644); height:${height};border-radius:4px;display:flex;align-items:flex-end;flex-direction:column;">
            <small style="font-size:11px;color:#444;margin-left:-4px;transform:rotate(-30deg);white-space:nowrap;">₱${day.revenue||0}</small>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:16px;">
        ${chartData.map(day => `<span style="font-size:12px;color:#666;text-align:center;flex:1">${day.date_label}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderWeeklyChartImage(chartData) {
  const max = Math.max(...chartData.map(x => x.revenue)) || 0;
  return chartData.map(day => ({
    date: day.date,
    revenue_height: (day.revenue / max * 100) %100 +
      (max===0 ? 0 : 2)
  }));
}

function displayDailySalesChartError() {
  const contentEl = document.querySelector('.sales-chart-content');
  const summaryEl = document.querySelector('.sales-chart-summary');
  
  const ordersEl = document.getElementById('todayOrdersCount');
  const revenueEl = document.getElementById('todayRevenue');
  
  if (ordersEl) ordersEl.textContent = '0';
  if (revenueEl) revenueEl.textContent = '₱0.00';
  
  const container = document.getElementById('salesCanvas');
  if (container) {
    container.innerHTML = '<div style="padding: 2rem; text-align:center; color: #6b7280;">Unable to load sales data.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Only load analytics if we are on the dashboard section
  if (window.USER_ROLE !== 'admin') {
    return;
  }
  
  // On landing page with 'DashboardForm', load analytics.
  if (document.getElementById('DashboardForm')?.style.display !== 'none') {
    setTimeout(() => loadDashboardAnalytics(), 200);
  }
});

if (typeof window !== 'undefined') window.loadDashboardAnalytics = loadDashboardAnalytics;
