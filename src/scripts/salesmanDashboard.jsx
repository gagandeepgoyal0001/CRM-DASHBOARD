import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../styles/salesmanDashboard.css';

// Google Sheets URL for sales data
const SALES_DATA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4g4GWB2Je79PFouIJycDPOFn47CjIrN4yqT9IJZ2hJWdhLR-mzO25u3bn6qh0PcVG5UJLfAB411UI/pub?output=csv';
const SALES_ACHIEVEMENT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4g4GWB2Je79PFouIJycDPOFn47CjIrN4yqT9IJZ2hJWdhLR-mzO25u3bn6qh0PcVG5UJLfAB411UI/pub?gid=1&output=csv';

// Sample data - Will be replaced with API data when available
const SAMPLE_DATA = {
  deals: [
    { id: 1, customerName: 'Rahul Sharma', project: 'Virat Greens', unit: '3BHK-A-1204', status: 'new', value: 9500000, date: '2023-11-10', phone: '9876543210' },
    { id: 2, customerName: 'Priya Singh', project: 'Virat Crown', unit: '4BHK-B-1803', status: 'in-progress', value: 15000000, date: '2023-11-12', phone: '8765432109' },
    { id: 3, customerName: 'Amit Verma', project: 'Virat Greens', unit: '2BHK-C-805', status: 'completed', value: 6500000, date: '2023-11-06', phone: '7654321098' },
    { id: 4, customerName: 'Deepika Patel', project: 'Virat Crown', unit: '3BHK-D-1505', status: 'negotiation', value: 12000000, date: '2023-11-14', phone: '6543210987' },
    { id: 5, customerName: 'Raj Malhotra', project: 'Virat Greens', unit: '3BHK-A-902', status: 'lost', value: 9800000, date: '2023-11-08', phone: '5432109876' },
  ],
  leads: [
    { id: 101, name: 'Vikram Mehta', phone: '9876543210', project: 'Virat Greens', status: 'Hot Lead', date: '2023-11-12', followUpDate: '2023-11-16', notes: 'Ready to book 3BHK' },
    { id: 102, name: 'Neha Gupta', phone: '8765432109', project: 'Virat Crown', status: 'Cold Lead', date: '2023-11-14', followUpDate: '2023-11-17', notes: 'Comparing options' },
    { id: 103, name: 'Karan Singh', phone: '7654321098', project: 'Virat Greens', status: 'Hot Lead', date: '2023-11-13', followUpDate: '2023-11-18', notes: 'Interested in premium units' },
  ],
  summary: {
    totalDeals: 27,
    dealsThisMonth: 8,
    totalRevenue: 289500000,
    revenueThisMonth: 87500000,
    targetThisMonth: 120000000,
    pendingDeals: 12,
    completedDeals: 15,
    conversionRate: 28,
    averageDealCycle: 14,
    dealsByProject: {
      'Virat Greens': 18,
      'Virat Crown': 9,
    },
    revenueByProject: {
      'Virat Greens': 172500000,
      'Virat Crown': 117000000,
    }
  }
};

const SalesmanDashboard = () => {
  const [data, setData] = useState(SAMPLE_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [viewingLead, setViewingLead] = useState(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch from main sales data sheet
        const salesResponse = await fetch(SALES_DATA_SHEET_URL);
        
        if (!salesResponse.ok) {
          throw new Error(`Failed to fetch sales data: ${salesResponse.status}`);
        }
        
        // Fetch from achievements sheet (second sheet)
        const achievementsResponse = await fetch(SALES_ACHIEVEMENT_SHEET_URL);
        
        if (!achievementsResponse.ok) {
          throw new Error(`Failed to fetch achievements data: ${achievementsResponse.status}`);
        }
        
        // Process sales data
        const salesCsv = await salesResponse.text();
        const salesRows = salesCsv.trim().split('\n').map(row => row.split(','));
        
        // Process achievements data
        const achievementsCsv = await achievementsResponse.text();
        const achievementsRows = achievementsCsv.trim().split('\n').map(row => row.split(','));
        
        // Find headers
        const salesHeaderIndex = salesRows.findIndex(row => 
          row.some(cell => cell && (
            cell.includes('Customer') || 
            cell.includes('Project') || 
            cell.includes('Date')
          ))
        );
        
        const achievementsHeaderIndex = achievementsRows.findIndex(row => 
          row.some(cell => cell && (
            cell.includes('Salesman') || 
            cell.includes('Target') || 
            cell.includes('Achievement')
          ))
        );
        
        if (salesHeaderIndex === -1 || achievementsHeaderIndex === -1) {
          throw new Error('Failed to find headers in the CSV data');
        }
        
        // Extract headers and data
        const salesHeaders = salesRows[salesHeaderIndex].map(h => h?.trim() || '');
        const salesData = salesRows.slice(salesHeaderIndex + 1);
        
        const achievementsHeaders = achievementsRows[achievementsHeaderIndex].map(h => h?.trim() || '');
        const achievementsData = achievementsRows.slice(achievementsHeaderIndex + 1);
        
        // Map column indexes
        const salesMap = {
          customerName: salesHeaders.findIndex(h => h.includes('Customer')),
          project: salesHeaders.findIndex(h => h.includes('Project')),
          unit: salesHeaders.findIndex(h => h.includes('Unit')),
          status: salesHeaders.findIndex(h => h.includes('Status')),
          value: salesHeaders.findIndex(h => h.includes('Value') || h.includes('Amount')),
          date: salesHeaders.findIndex(h => h.includes('Date')),
          phone: salesHeaders.findIndex(h => h.includes('Phone') || h.includes('Contact'))
        };
        
        const achievementsMap = {
          salesman: achievementsHeaders.findIndex(h => h.includes('Salesman')),
          target: achievementsHeaders.findIndex(h => h.includes('Target')),
          achievement: achievementsHeaders.findIndex(h => h.includes('Achievement')),
          month: achievementsHeaders.findIndex(h => h.includes('Month')),
          project: achievementsHeaders.findIndex(h => h.includes('Project'))
        };
        
        // Process sales data
        const deals = salesData
          .filter(row => row.length > Math.max(...Object.values(salesMap)))
          .map((row, index) => ({
            id: index + 1,
            customerName: row[salesMap.customerName]?.trim() || `Customer ${index + 1}`,
            project: row[salesMap.project]?.trim() || 'Unknown',
            unit: row[salesMap.unit]?.trim() || '-',
            status: row[salesMap.status]?.trim().toLowerCase() || 'new',
            value: parseFloat(row[salesMap.value]?.replace(/[^0-9.-]+/g, '') || '0'),
            date: row[salesMap.date]?.trim() || new Date().toISOString().split('T')[0],
            phone: row[salesMap.phone]?.trim() || '-'
          }));
        
        // Process achievements data
        const achievements = achievementsData
          .filter(row => row.length > Math.max(...Object.values(achievementsMap)))
          .map((row, index) => ({
            id: index + 1,
            salesman: row[achievementsMap.salesman]?.trim() || 'Unknown',
            target: parseFloat(row[achievementsMap.target]?.replace(/[^0-9.-]+/g, '') || '0'),
            achievement: parseFloat(row[achievementsMap.achievement]?.replace(/[^0-9.-]+/g, '') || '0'),
            month: row[achievementsMap.month]?.trim() || 'Current',
            project: row[achievementsMap.project]?.trim() || 'All Projects'
          }));
        
        // Calculate summary metrics from the real data
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        
        const completedDeals = deals.filter(deal => deal.status === 'completed' || deal.status === 'done').length;
        const pendingDeals = deals.filter(deal => deal.status !== 'completed' && deal.status !== 'done' && deal.status !== 'lost').length;
        
        const totalRevenue = deals.reduce((sum, deal) => sum + deal.value, 0);
        
        // Current month's deals
        const thisMonthDeals = deals.filter(deal => {
          const dealDate = new Date(deal.date);
          return dealDate.getMonth() === new Date().getMonth() && 
                 dealDate.getFullYear() === new Date().getFullYear();
        });
        
        const revenueThisMonth = thisMonthDeals.reduce((sum, deal) => sum + deal.value, 0);
        
        // Calculate achievement vs target
        const currentTargets = achievements.filter(a => 
          a.month.toLowerCase().includes(currentMonth.toLowerCase()) || 
          a.month.includes(currentYear.toString())
        );
        
        let targetThisMonth = 120000000; // Default fallback
        if (currentTargets.length > 0) {
          targetThisMonth = currentTargets.reduce((sum, target) => sum + target.target, 0);
        }
        
        // Calculate project-specific metrics
        const projectNames = [...new Set(deals.map(deal => deal.project))];
        const dealsByProject = {};
        const revenueByProject = {};
        
        projectNames.forEach(project => {
          const projectDeals = deals.filter(deal => deal.project === project);
          dealsByProject[project] = projectDeals.length;
          revenueByProject[project] = projectDeals.reduce((sum, deal) => sum + deal.value, 0);
        });
        
        // Update data state with real data and calculated metrics
        setData({
          deals,
          leads: data.leads, // Keep the sample leads for now
          summary: {
            totalDeals: deals.length,
            dealsThisMonth: thisMonthDeals.length,
            totalRevenue,
            revenueThisMonth,
            targetThisMonth,
            pendingDeals,
            completedDeals,
            conversionRate: deals.length > 0 ? Math.round((completedDeals / deals.length) * 100) : 0,
            averageDealCycle: 14, // This would need more data to calculate properly
            dealsByProject,
            revenueByProject
          }
        });
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching real data:', err);
        setError(`Failed to load dashboard data. Using sample data instead. Error: ${err.message}`);
        // Fallback to sample data
        setData(SAMPLE_DATA);
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 10 minutes
    const interval = setInterval(() => fetchData(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize charts
  useEffect(() => {
    if (!loading && !error) {
      initializeCharts();
    }
  }, [loading, error, data]);

  const initializeCharts = () => {
    // Deal Status Chart
    const dealStatusCtx = document.getElementById('dealStatusChart')?.getContext('2d');
    if (dealStatusCtx) {
      new Chart(dealStatusCtx, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress', 'New', 'Negotiation', 'Lost'],
          datasets: [{
            data: [
              data.summary.completedDeals,
              data.summary.pendingDeals - 5,
              3,
              2,
              5
            ],
            backgroundColor: [
              '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            }
          }
        }
      });
    }

    // Revenue by Project Chart
    const revenueByProjectCtx = document.getElementById('revenueByProjectChart')?.getContext('2d');
    if (revenueByProjectCtx) {
      new Chart(revenueByProjectCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(data.summary.revenueByProject),
          datasets: [{
            label: 'Revenue (in Crores)',
            data: Object.values(data.summary.revenueByProject).map(val => val / 10000000),
            backgroundColor: ['#3498db', '#2ecc71'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Crores (₹)'
              }
            }
          }
        }
      });
    }

    // Monthly Performance Chart
    const monthlyPerformanceCtx = document.getElementById('monthlyPerformanceChart')?.getContext('2d');
    if (monthlyPerformanceCtx) {
      new Chart(monthlyPerformanceCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Deals',
            data: [3, 5, 4, 6, 4, 7, 5, 4, 6, 5, 8, 2],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  };

  const refreshData = () => {
    setLoading(true);
    // In a real app, this would make a fresh API call
    setTimeout(() => {
      setData(SAMPLE_DATA);
      setLoading(false);
      initializeCharts();
    }, 1000);
  };

  // Filter deals based on search and filters
  const filteredDeals = data.deals.filter(deal => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      deal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.phone.includes(searchQuery);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
    
    // Project filter
    const matchesProject = filterProject === 'all' || deal.project === filterProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Handle tab content
  const getTabContent = () => {
    switch (activeTab) {
      case 'deals':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h2 className="section-title">Deals Management</h2>
              <div className="section-controls">
                <button className="action-button primary">
                  <i className="fa fa-plus"></i> New Deal
                </button>
              </div>
            </div>
            
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Unit</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map(deal => (
                    <tr key={deal.id}>
                      <td>{deal.customerName}</td>
                      <td>{deal.project}</td>
                      <td>{deal.unit}</td>
                      <td>{formatCurrency(deal.value)}</td>
                      <td>
                        <span className={`status-badge ${deal.status}`}>
                          {deal.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td>{new Date(deal.date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-button primary sm">
                            <i className="fa fa-edit"></i> Edit
                          </button>
                          <button className="action-button success sm">
                            <i className="fa fa-check"></i> Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'leads':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h2 className="section-title">Lead Management</h2>
              <div className="section-controls">
                <button className="action-button primary">
                  <i className="fa fa-phone"></i> Follow Up
                </button>
              </div>
            </div>
            
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Follow Up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map(lead => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.project}</td>
                      <td>
                        <span className={`status-badge ${lead.status.toLowerCase().replace(' ', '-')}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{new Date(lead.followUpDate).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button primary sm"
                            onClick={() => {
                              setViewingLead(lead);
                              setShowLeadDetail(true);
                            }}
                          >
                            <i className="fa fa-eye"></i> View
                          </button>
                          <button className="action-button success sm">
                            <i className="fa fa-exchange"></i> Convert
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'performance':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h2 className="section-title">Performance Analytics</h2>
            </div>
            
            <div className="dashboard-charts">
              <div className="chart-container">
                <h3 className="chart-title">Monthly Deals</h3>
                <canvas id="monthlyPerformanceChart" height="250"></canvas>
              </div>
            </div>
            
            <div className="data-section">
              <div className="section-header">
                <h3>Performance Metrics</h3>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Conversion Rate</div>
                  <div className="detail-value">{data.summary.conversionRate}%</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Avg. Deal Cycle</div>
                  <div className="detail-value">{data.summary.averageDealCycle} days</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Deals This Month</div>
                  <div className="detail-value">{data.summary.dealsThisMonth}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Revenue This Month</div>
                  <div className="detail-value">{formatCurrency(data.summary.revenueThisMonth)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="salesman-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="salesman-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={refreshData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="salesman-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Salesman Dashboard</h1>
        <p className="dashboard-subtitle">Manage deals and client interactions</p>
        <button className="refresh-button" onClick={refreshData}>
          <i className="fa fa-refresh"></i> Refresh
        </button>
      </div>

      {/* Dashboard Overview */}
      <div className="dashboard-overview">
        <div className="stat-card deals">
          <div className="stat-icon">🤝</div>
          <div className="stat-title">Total Deals</div>
          <div className="stat-value">{data.summary.totalDeals}</div>
          <div className="stat-info">
            {data.summary.dealsThisMonth} this month
          </div>
        </div>
        
        <div className="stat-card target">
          <div className="stat-icon">🎯</div>
          <div className="stat-title">Monthly Target</div>
          <div className="stat-value">{formatCurrency(data.summary.targetThisMonth)}</div>
          <div className="stat-info">
            {Math.round((data.summary.revenueThisMonth / data.summary.targetThisMonth) * 100)}% achieved
          </div>
          <div className="progress-container">
            <div 
              className={`progress-bar ${
                (data.summary.revenueThisMonth / data.summary.targetThisMonth) > 0.8 ? 'good' : 
                (data.summary.revenueThisMonth / data.summary.targetThisMonth) > 0.5 ? 'warning' : 'danger'
              }`}
              style={{ width: `${Math.min(100, Math.round((data.summary.revenueThisMonth / data.summary.targetThisMonth) * 100))}%` }}
            ></div>
          </div>
        </div>
        
        <div className="stat-card commission">
          <div className="stat-icon">💰</div>
          <div className="stat-title">Commission</div>
          <div className="stat-value">{formatCurrency(data.summary.revenueThisMonth * 0.02)}</div>
          <div className="stat-info">
            2% of monthly sales
          </div>
        </div>
        
        <div className="stat-card sales">
          <div className="stat-icon">📈</div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">{formatCurrency(data.summary.totalRevenue)}</div>
          <div className="stat-info">
            <span className="stat-increase">+{formatCurrency(data.summary.revenueThisMonth)} this month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3 className="chart-title">Deal Status</h3>
          <canvas id="dealStatusChart" height="220"></canvas>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">Revenue by Project</h3>
          <canvas id="revenueByProjectChart" height="220"></canvas>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="search-panel">
        <div className="search-header">
          <h2 className="search-title">Deal Management</h2>
        </div>
        
        <div className="search-container">
          <div className="search-field">
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, project, unit or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="negotiation">Negotiation</option>
              <option value="completed">Completed</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Project</label>
            <select 
              className="filter-select"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              <option value="Virat Greens">Virat Greens</option>
              <option value="Virat Crown">Virat Crown</option>
            </select>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterProject('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Tabs for Different Views */}
      <div className="dashboard-tabs">
        <div className="tabs-nav">
          <button 
            className={`tab-button ${activeTab === 'deals' ? 'active' : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            Deals
          </button>
          <button 
            className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Leads
          </button>
          <button 
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </div>
        
        {getTabContent()}
      </div>

      {/* Quick Action Section */}
      <div className="quick-actions">
        <h2 className="actions-header">Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon add-deal-icon">📑</div>
            <h3 className="action-title">New Deal</h3>
            <p className="action-description">Create a new deal from scratch</p>
            <button className="action-button primary">Create Deal</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon schedule-icon">📅</div>
            <h3 className="action-title">Schedule Follow-up</h3>
            <p className="action-description">Plan your next client interaction</p>
            <button className="action-button primary">Schedule</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon report-icon">📊</div>
            <h3 className="action-title">Generate Report</h3>
            <p className="action-description">Create performance reports</p>
            <button className="action-button primary">Generate</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon customer-icon">👥</div>
            <h3 className="action-title">Customer Database</h3>
            <p className="action-description">Access your client information</p>
            <button className="action-button primary">View Clients</button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {showLeadDetail && viewingLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Lead Details</h2>
              <button className="close-btn" onClick={() => setShowLeadDetail(false)}>×</button>
            </div>
            
            <div className="lead-detail">
              <div className="tabs-nav">
                <button className="tab-button active">Details</button>
                <button className="tab-button">History</button>
                <button className="tab-button">Tasks</button>
              </div>
              
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Name</div>
                    <div className="detail-value">{viewingLead.name}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Phone</div>
                    <div className="detail-value">{viewingLead.phone}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Project Interest</div>
                    <div className="detail-value">{viewingLead.project}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      <span className={`status-badge ${viewingLead.status.toLowerCase().replace(' ', '-')}`}>
                        {viewingLead.status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Received Date</div>
                    <div className="detail-value">{new Date(viewingLead.date).toLocaleDateString()}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Follow-up Date</div>
                    <div className="detail-value">{new Date(viewingLead.followUpDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Notes</h3>
                <p>{viewingLead.notes}</p>
              </div>
              
              <div className="form-section">
                <h3>Add Follow-up</h3>
                <div className="form-group">
                  <label>Follow-up Type</label>
                  <select className="filter-select">
                    <option>Call</option>
                    <option>Meeting</option>
                    <option>Site Visit</option>
                    <option>Email</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input type="datetime-local" className="filter-select" />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="filter-select" rows="3" placeholder="Add notes for the follow-up..."></textarea>
                </div>
                <div className="form-buttons">
                  <button className="cancel-btn">Cancel</button>
                  <button className="submit-btn">Schedule Follow-up</button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="action-button warning" onClick={() => setShowLeadDetail(false)}>
                Close
              </button>
              <button className="action-button success">
                Convert to Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmanDashboard; 