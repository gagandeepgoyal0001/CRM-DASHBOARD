import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../styles/salesCoordinatorDashboard.css';

// Sample data structure - Replace with actual API calls in production
const SAMPLE_DATA = {
  visits: [
    { id: 1, customerName: 'Rahul Sharma', project: 'Virat Greens', status: 'scheduled', date: '2023-11-15', time: '10:00 AM', phone: '9876543210', address: 'Sector 42, Gurugram', notes: 'Interested in 3BHK' },
    { id: 2, customerName: 'Priya Singh', project: 'Virat Crown', status: 'completed', date: '2023-11-10', time: '11:30 AM', phone: '8765432109', address: 'DLF Phase 3, Gurugram', notes: 'Liked the floor plan, discussing payment options' },
    { id: 3, customerName: 'Amit Verma', project: 'Virat Greens', status: 'cancelled', date: '2023-11-18', time: '3:00 PM', phone: '7654321098', address: 'Sector 57, Gurugram', notes: 'Rescheduling due to personal reasons' },
    { id: 4, customerName: 'Deepika Patel', project: 'Virat Crown', status: 'pending', date: '2023-11-20', time: '2:00 PM', phone: '6543210987', address: 'Sushant Lok, Gurugram', notes: 'Confirmation pending' },
    { id: 5, customerName: 'Raj Malhotra', project: 'Virat Greens', status: 'transferred', date: '2023-11-12', time: '4:30 PM', phone: '5432109876', address: 'Golf Course Road, Gurugram', notes: 'Transferred to salesman for closing' },
  ],
  leads: [
    { id: 101, name: 'Vikram Mehta', phone: '9876543210', source: 'Website', project: 'Virat Greens', status: 'Hot Lead', date: '2023-11-12', followUpDate: '2023-11-16', notes: 'Looking for 3BHK within 1.5 Cr budget' },
    { id: 102, name: 'Neha Gupta', phone: '8765432109', source: 'Facebook', project: 'Virat Crown', status: 'Good Lead', date: '2023-11-14', followUpDate: '2023-11-17', notes: 'Interested in premium apartments' },
    { id: 103, name: 'Karan Singh', phone: '7654321098', source: 'Referral', project: 'Virat Greens', status: 'Cold Lead', date: '2023-11-13', followUpDate: '2023-11-18', notes: 'Just exploring options' },
    { id: 104, name: 'Ananya Reddy', phone: '6543210987', source: 'Instagram', project: 'Virat Crown', status: 'Hot Lead', date: '2023-11-15', followUpDate: '2023-11-19', notes: 'Ready to visit the site' },
    { id: 105, name: 'Suresh Iyer', phone: '5432109876', source: 'Property Portal', project: 'Virat Greens', status: 'Good Lead', date: '2023-11-16', followUpDate: '2023-11-20', notes: 'Comparing with other properties' },
  ],
  summary: {
    totalLeads: 127,
    newLeadsToday: 8,
    scheduledVisits: 12,
    completedVisits: 5,
    pendingVisits: 7,
    visitsThisWeek: 18,
    visitsNextWeek: 8,
    leadsConvertedToVisits: 24,
    upcomingVisits: [
      { date: '2023-11-17', count: 3 },
      { date: '2023-11-18', count: 2 },
      { date: '2023-11-19', count: 4 },
      { date: '2023-11-20', count: 1 },
      { date: '2023-11-21', count: 2 },
    ],
    visitsByProject: {
      'Virat Greens': 15,
      'Virat Crown': 9,
    },
  }
};

const SalesCoordinatorDashboard = () => {
  const [data, setData] = useState(SAMPLE_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewingVisit, setViewingVisit] = useState(null);
  const [showVisitDetail, setShowVisitDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Simulate data fetching
  useEffect(() => {
    const fetchData = () => {
      try {
        // In a real app, this would be an API call
        // For now, using sample data
        setTimeout(() => {
          setData(SAMPLE_DATA);
          setLoading(false);
        }, 1000); // Simulate network delay
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize charts
  useEffect(() => {
    if (!loading && !error) {
      initializeCharts();
    }
  }, [loading, error]);

  const initializeCharts = () => {
    // Visit Status Chart
    const visitStatusCtx = document.getElementById('visitStatusChart')?.getContext('2d');
    if (visitStatusCtx) {
      new Chart(visitStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending', 'Scheduled', 'Cancelled'],
          datasets: [{
            data: [data.summary.completedVisits, data.summary.pendingVisits, 
                  (data.summary.scheduledVisits - data.summary.completedVisits - data.summary.pendingVisits), 2],
            backgroundColor: [
              '#2ecc71', '#f39c12', '#3498db', '#e74c3c'
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

    // Visit Trend Chart
    const visitTrendCtx = document.getElementById('visitTrendChart')?.getContext('2d');
    if (visitTrendCtx) {
      new Chart(visitTrendCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Visits',
            data: [3, 5, 2, 6, 4, 7, 3],
            borderColor: '#3498db',
            tension: 0.1,
            fill: false
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

    // Projects Chart
    const projectsCtx = document.getElementById('projectsChart')?.getContext('2d');
    if (projectsCtx) {
      new Chart(projectsCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(data.summary.visitsByProject),
          datasets: [{
            label: 'Visits by Project',
            data: Object.values(data.summary.visitsByProject),
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
    // Simulate data refresh
    setTimeout(() => {
      setData(SAMPLE_DATA);
      setLoading(false);
      // Re-initialize charts
      initializeCharts();
    }, 1000);
  };

  // Filter visits based on search and filters
  const filteredVisits = data.visits.filter(visit => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      visit.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.phone.includes(searchQuery);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    
    // Project filter
    const matchesProject = filterProject === 'all' || visit.project === filterProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Handle tab changes
  const getTabContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <div className="tab-content">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits
                    .filter(visit => new Date(visit.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(visit => (
                      <tr key={visit.id}>
                        <td>{visit.customerName}</td>
                        <td>{visit.project}</td>
                        <td>{new Date(visit.date).toLocaleDateString()} {visit.time}</td>
                        <td>
                          <span className={`status-badge ${visit.status}`}>
                            {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-button primary sm"
                            onClick={() => {
                              setViewingVisit(visit);
                              setShowVisitDetail(true);
                            }}
                          >
                            <i className="fa fa-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'all':
        return (
          <div className="tab-content">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map(visit => (
                    <tr key={visit.id}>
                      <td>{visit.customerName}</td>
                      <td>{visit.project}</td>
                      <td>{new Date(visit.date).toLocaleDateString()} {visit.time}</td>
                      <td>
                        <span className={`status-badge ${visit.status}`}>
                          {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-button primary sm"
                          onClick={() => {
                            setViewingVisit(visit);
                            setShowVisitDetail(true);
                          }}
                        >
                          <i className="fa fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="tab-content">
            <div className="calendar-container">
              <div className="calendar-header">
                <div className="calendar-title">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="calendar-navigation">
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                  >
                    &#8249;
                  </button>
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                  >
                    &#8250;
                  </button>
                </div>
              </div>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div className="calendar-header-cell" key={day}>{day}</div>
                ))}
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        );
      
      case 'leads':
        return (
          <div className="tab-content">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map(lead => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td>{lead.project}</td>
                      <td>
                        <span className={`status-badge ${lead.status.toLowerCase().replace(' ', '-')}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-button success sm">
                            <i className="fa fa-calendar"></i> Schedule
                          </button>
                          <button className="action-button warning sm">
                            <i className="fa fa-phone"></i> Call
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
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Calendar rendering helpers
  const renderCalendarDays = () => {
    const days = [];
    const date = new Date(currentYear, currentMonth, 1);
    const today = new Date();
    
    // Get the day of the week of the first day (0-6, where 0 is Sunday)
    const firstDayOfMonth = date.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
    }
    
    // Add cells for all days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find visits for this day
      const visitsOnDay = data.visits.filter(visit => visit.date === dateStr);
      const hasEvents = visitsOnDay.length > 0;
      
      // Check if it's today
      const isToday = 
        today.getDate() === day && 
        today.getMonth() === currentMonth && 
        today.getFullYear() === currentYear;
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
        >
          <div className="day-number">{day}</div>
          {hasEvents && (
            <div className="day-events">
              {visitsOnDay.map((visit, idx) => (
                <div 
                  key={idx} 
                  className="day-event"
                  onClick={() => {
                    setViewingVisit(visit);
                    setShowVisitDetail(true);
                  }}
                >
                  {visit.time} - {visit.customerName}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Loading state
  if (loading) {
    return (
      <div className="sales-coordinator-dashboard">
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
      <div className="sales-coordinator-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={refreshData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-coordinator-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Sales Coordinator Dashboard</h1>
        <p className="dashboard-subtitle">Manage site visits and customer interactions</p>
        <button className="refresh-button" onClick={refreshData}>
          <i className="fa fa-refresh"></i> Refresh
        </button>
      </div>

      {/* Dashboard Overview */}
      <div className="dashboard-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-title">Total Leads</div>
          <div className="stat-value">{data.summary.totalLeads}</div>
          <div className="stat-info">
            <span className="stat-increase">+{data.summary.newLeadsToday} today</span>
          </div>
        </div>
        
        <div className="stat-card visits">
          <div className="stat-icon">📅</div>
          <div className="stat-title">Scheduled Visits</div>
          <div className="stat-value">{data.summary.scheduledVisits}</div>
          <div className="stat-info">This week: {data.summary.visitsThisWeek}</div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-title">Completed Visits</div>
          <div className="stat-value">{data.summary.completedVisits}</div>
          <div className="stat-info">
            {Math.round((data.summary.completedVisits / data.summary.scheduledVisits) * 100)}% completion rate
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-title">Pending Visits</div>
          <div className="stat-value">{data.summary.pendingVisits}</div>
          <div className="stat-info">Next week: {data.summary.visitsNextWeek}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3 className="chart-title">Visit Status</h3>
          <canvas id="visitStatusChart" height="220"></canvas>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">Weekly Visit Trend</h3>
          <canvas id="visitTrendChart" height="220"></canvas>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">Visits by Project</h3>
          <canvas id="projectsChart" height="220"></canvas>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="search-panel">
        <div className="search-header">
          <h2 className="search-title">Visit Management</h2>
        </div>
        
        <div className="search-container">
          <div className="search-field">
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, project or phone number..." 
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="transferred">Transferred</option>
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
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Visits
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Visits
          </button>
          <button 
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Lead Management
          </button>
        </div>
        
        {getTabContent()}
      </div>

      {/* Quick Action Section */}
      <div className="quick-actions">
        <h2 className="actions-header">Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon schedule-icon">📅</div>
            <h3 className="action-title">Schedule New Visit</h3>
            <p className="action-description">Create a new site visit appointment for a lead</p>
            <button className="action-button primary">Schedule Visit</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon transfer-icon">🔄</div>
            <h3 className="action-title">Transfer to Salesman</h3>
            <p className="action-description">Transfer qualified leads to sales team</p>
            <button className="action-button primary">Transfer Leads</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon feedback-icon">📋</div>
            <h3 className="action-title">Visit Feedback</h3>
            <p className="action-description">Record feedback from completed visits</p>
            <button className="action-button primary">Add Feedback</button>
          </div>
          
          <div className="action-card">
            <div className="action-icon document-icon">📊</div>
            <h3 className="action-title">Generate Report</h3>
            <p className="action-description">Create visit summary reports</p>
            <button className="action-button primary">Create Report</button>
          </div>
        </div>
      </div>

      {/* Visit Detail Modal */}
      {showVisitDetail && viewingVisit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Visit Details</h2>
              <button className="close-btn" onClick={() => setShowVisitDetail(false)}>×</button>
            </div>
            
            <div className="visit-detail">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Name</div>
                    <div className="detail-value">{viewingVisit.customerName}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Phone</div>
                    <div className="detail-value">{viewingVisit.phone}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Address</div>
                    <div className="detail-value">{viewingVisit.address}</div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Visit Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Project</div>
                    <div className="detail-value">{viewingVisit.project}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">{new Date(viewingVisit.date).toLocaleDateString()}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Time</div>
                    <div className="detail-value">{viewingVisit.time}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      <span className={`status-badge ${viewingVisit.status}`}>
                        {viewingVisit.status.charAt(0).toUpperCase() + viewingVisit.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Notes</div>
                    <div className="detail-value">{viewingVisit.notes}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="action-button warning" onClick={() => setShowVisitDetail(false)}>
                <i className="fa fa-times"></i> Close
              </button>
              <button className="action-button success">
                <i className="fa fa-check"></i> Update Status
              </button>
              <button className="action-button primary">
                <i className="fa fa-exchange"></i> Transfer to Salesman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCoordinatorDashboard; 