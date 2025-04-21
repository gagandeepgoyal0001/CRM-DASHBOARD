// scripts/home.jsx
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../styles/home.css';

// URLs for all data sources
const DATA_SOURCES = {
  telecaller: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQL2FFpsyRDa6Sv2rj8qjIlYBkxcXDJbV4nwdLxxIeegJj9KG8XTZdwAD7C4gr56uJhCvada8qoj-x7/pub?output=csv',
  salesCoordinator: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzL_R75V1wX-XnGwzoU6h627ErY-tFuCSP3OBclfee2FuZXYEt1TbI37goL_1_ez4Dzt6Wc2M0gMh9/pub?output=csv',
  salesman: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4g4GWB2Je79PFouIJycDPOFn47CjIrN4yqT9IJZ2hJWdhLR-mzO25u3bn6qh0PcVG5UJLfAB411UI/pub?output=csv',
};

const Home = () => {
  const [summary, setSummary] = useState({
    totalLeads: 0,
    convertedDeals: 0,
    scheduledVisits: 0,
    completedVisits: 0,
    leadsBySource: {},
    leadsByProject: {},
    recentLeads: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(''); // Clear previous errors
        
        console.log('Fetching dashboard data from sources...');
        
        // Use Promise.allSettled to handle potential failures gracefully
        const results = await Promise.allSettled([
          fetch(DATA_SOURCES.telecaller).then(response => {
            if (!response.ok) throw new Error(`Telecaller API failed: ${response.status}`);
            return response.text();
          }),
          fetch(DATA_SOURCES.salesCoordinator).then(response => {
            if (!response.ok) throw new Error(`Sales Coordinator API failed: ${response.status}`);
            return response.text();
          }),
          fetch(DATA_SOURCES.salesman).then(response => {
            if (!response.ok) throw new Error(`Salesman API failed: ${response.status}`);
            return response.text();
          })
        ]);
        
        // Check if all promises are rejected
        if (results.every(result => result.status === 'rejected')) {
          throw new Error('Failed to fetch data from all sources. Please check your internet connection or data source URLs.');
        }
        
        // Process successful results
        const data = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === 'fulfilled') {
            try {
              const csvText = result.value;
              const rows = csvText.trim().split('\n').map(row => row.split(','));
              
              // Find header row by looking for key columns
              const headerIndex = rows.findIndex(row => 
                row.some(cell => 
                  cell && (cell.includes('DATE/TIME') || cell.includes('DATE') || 
                          cell.includes('NAME') || cell.includes('NUMBER'))
                )
              );
              
              if (headerIndex === -1) {
                console.warn(`Header row not found in data source ${i + 1}, skipping...`);
                continue;
              }
              
              const headers = rows[headerIndex].map(h => h ? h.trim() : '');
              data.push({
                sourceIndex: i,
                headers,
                data: rows.slice(headerIndex + 1)
              });
            } catch (err) {
              console.error(`Error processing data from source ${i + 1}:`, err);
            }
          } else {
            console.warn(`Failed to fetch from source ${i + 1}:`, result.reason);
          }
        }
        
        if (data.length === 0) {
          throw new Error('No valid data could be retrieved from any source. Please check the data format.');
        }
        
        // Process the data and update dashboard
        // Track unique phone numbers to avoid counting duplicate leads
        const uniquePhoneNumbers = new Set();
        let convertedCount = 0;
        let scheduledVisitsCount = 0;
        let completedVisitsCount = 0;
        let sourceCounts = {};
        let projectCounts = {};
        let recentLeadsList = [];
        
        data.forEach(({ headers, data }) => {
          // Find column indexes
          const phoneIndex = headers.findIndex(h => h.includes('NUMBER') || h.includes('PHONE') || h.includes('MOBILE'));
          const statusIndex = headers.findIndex(h => h.includes('STATUS'));
          const visitDateIndex = headers.findIndex(h => h.includes('VISIT DATE') || h.includes('1ST VISIT DATE'));
          const visitStatusIndex = headers.findIndex(h => h.includes('VISIT STATUS') || h.includes('1ST VISIT STATUS') || h.includes('VISIT DONE'));
          const sourceIndex = headers.findIndex(h => h.includes('SOURCE') || h.includes('GOOGLE') || h.includes('FACEBOOK') || h.includes('INSTAGRAM'));
          const projectIndex = headers.findIndex(h => h.includes('PROJECT') || h.includes('VIRAT GREENS') || h.includes('VIRAT CROWN'));
          const dateIndex = headers.findIndex(h => h.includes('DATE/TIME') || h.includes('DATE'));
          const nameIndex = headers.findIndex(h => h.includes('NAME'));
          
          // Skip if essential columns are missing
          if (phoneIndex === -1) {
            console.warn('Phone/NUMBER column not found, skipping data set');
            return;
          }
          
          data.forEach(row => {
            if (!row || row.length <= phoneIndex) return;
            
            // Track unique leads by phone number
            const phoneNumber = row[phoneIndex]?.trim();
            if (phoneNumber && phoneNumber.length >= 10) {
              uniquePhoneNumbers.add(phoneNumber);
              
              // Count converted deals
              if (statusIndex >= 0 && row.length > statusIndex && row[statusIndex]) {
                const status = row[statusIndex].trim().toUpperCase();
                if (status === 'DEAL DONE' || status === 'CONVERTED' || status === 'CLOSED') {
                  convertedCount++;
                }
              }
              
              // Count scheduled and completed visits
              if (visitDateIndex >= 0 && row.length > visitDateIndex && row[visitDateIndex]?.trim()) {
                scheduledVisitsCount++;
                
                if (visitStatusIndex >= 0 && row.length > visitStatusIndex && row[visitStatusIndex]) {
                  const visitStatus = row[visitStatusIndex].trim().toLowerCase();
                  if (visitStatus === 'done' || visitStatus === 'visited' || visitStatus === 'yes' || visitStatus === 'completed') {
                    completedVisitsCount++;
                  }
                }
              }
              
              // Count by source
              if (sourceIndex >= 0 && row.length > sourceIndex && row[sourceIndex]) {
                const source = row[sourceIndex].trim();
                if (source) {
                  sourceCounts[source] = (sourceCounts[source] || 0) + 1;
                }
              }
              
              // Count by project interest
              if (projectIndex >= 0 && row.length > projectIndex && row[projectIndex]) {
                const project = row[projectIndex].trim();
                if (project) {
                  projectCounts[project] = (projectCounts[project] || 0) + 1;
                }
              }
              
              // Collect recent leads (from the last 7 days)
              if (dateIndex >= 0 && nameIndex >= 0 && row.length > Math.max(dateIndex, nameIndex) && row[dateIndex]) {
                try {
                  // Parse date, accepting various formats
                  let leadDate;
                  const dateStr = row[dateIndex].trim();
                  
                  if (dateStr.includes('/')) {
                    // DD/MM/YYYY or MM/DD/YYYY format
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                      // Assume DD/MM/YYYY format as common in India
                      leadDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                  } else {
                    // Try standard date parsing
                    leadDate = new Date(dateStr);
                  }
                  
                  if (leadDate && !isNaN(leadDate.getTime())) {
                    const now = new Date();
                    const daysDiff = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff < 7) {
                      recentLeadsList.push({
                        date: row[dateIndex],
                        name: row[nameIndex] || 'Unknown',
                        contact: phoneNumber || 'Not provided',
                        status: statusIndex >= 0 && row.length > statusIndex ? row[statusIndex] || 'New' : 'New'
                      });
                    }
                  }
                } catch (e) {
                  // Skip date parsing errors
                  console.warn('Date parsing error:', e);
                }
              }
            }
          });
        });
        
        // Sort recent leads by date (newest first) and take top 5
        recentLeadsList.sort((a, b) => {
          try {
            return new Date(b.date) - new Date(a.date);
          } catch (e) {
            return 0;
          }
        });
        recentLeadsList = recentLeadsList.slice(0, 5);
        
        // Update summary state with all calculated data
        setSummary({
          totalLeads: uniquePhoneNumbers.size,
          convertedDeals: convertedCount,
          scheduledVisits: scheduledVisitsCount,
          completedVisits: completedVisitsCount,
          leadsBySource: sourceCounts,
          leadsByProject: projectCounts,
          recentLeads: recentLeadsList
        });
        
        setLoading(false);
        
        // Initialize charts if we have data
        if (Object.keys(sourceCounts).length > 0 || Object.keys(projectCounts).length > 0) {
          initializeCharts(sourceCounts, projectCounts, scheduledVisitsCount, completedVisitsCount);
        }
        
        console.log('Dashboard data processed successfully');
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeCharts = (sourceCounts, projectCounts, scheduledVisits, completedVisits) => {
    try {
      // Safely destroy any existing charts to prevent memory leaks
      Chart.getChart('sourceChart')?.destroy();
      Chart.getChart('projectChart')?.destroy();
      Chart.getChart('visitsChart')?.destroy();

      // Source Distribution Chart
      const sourceCtx = document.getElementById('sourceChart')?.getContext('2d');
      if (sourceCtx && Object.keys(sourceCounts).length > 0) {
        // Prepare colors - ensure we have enough
        const colors = [
          '#4287f5', '#42c2f5', '#42f5e3', '#42f582', '#f5de42',
          '#f5aa42', '#f54242', '#f542f2', '#c642f5', '#8042f5'
        ];
        
        // If we have more sources than colors, generate additional ones
        const sourceKeys = Object.keys(sourceCounts);
        while (colors.length < sourceKeys.length) {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }

        new Chart(sourceCtx, {
          type: 'pie',
          data: {
            labels: sourceKeys,
            datasets: [{
              data: Object.values(sourceCounts),
              backgroundColor: colors.slice(0, sourceKeys.length),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Lead Sources'
              },
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 15,
                  font: {
                    size: 10
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      } else if (sourceCtx) {
        // Display a "no data" message when there's no source data
        new Chart(sourceCtx, {
          type: 'pie',
          data: {
            labels: ['No Data'],
            datasets: [{
              data: [1],
              backgroundColor: ['#e0e0e0'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Lead Sources - No Data Available'
              },
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          }
        });
      }

      // Project Interest Chart
      const projectCtx = document.getElementById('projectChart')?.getContext('2d');
      if (projectCtx && Object.keys(projectCounts).length > 0) {
        new Chart(projectCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(projectCounts),
            datasets: [{
              label: 'Interest Count',
              data: Object.values(projectCounts),
              backgroundColor: '#4287f5',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Project Interest'
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0 // Only show integers
                }
              }
            }
          }
        });
      } else if (projectCtx) {
        // Display a "no data" message when there's no project data
        new Chart(projectCtx, {
          type: 'bar',
          data: {
            labels: ['No Data'],
            datasets: [{
              label: 'No Data Available',
              data: [0],
              backgroundColor: '#e0e0e0',
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Project Interest - No Data Available'
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 1
              }
            }
          }
        });
      }

      // Visits Completion Rate
      const visitsCtx = document.getElementById('visitsChart')?.getContext('2d');
      if (visitsCtx && scheduledVisits > 0) {
        // Ensure we don't have negative values
        const completed = Math.max(0, completedVisits);
        const pending = Math.max(0, scheduledVisits - completedVisits);
        
        new Chart(visitsCtx, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
              data: [completed, pending],
              backgroundColor: ['#42c2f5', '#f5aa42'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Visit Completion Rate'
              },
              subtitle: {
                display: true,
                text: `${Math.round((completed / Math.max(scheduledVisits, 1)) * 100)}%`
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      } else if (visitsCtx) {
        // Display a "no data" message when there are no scheduled visits
        new Chart(visitsCtx, {
          type: 'doughnut',
          data: {
            labels: ['No Scheduled Visits'],
            datasets: [{
              data: [1],
              backgroundColor: ['#e0e0e0'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Visit Completion Rate - No Data'
              },
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error initializing charts:', error);
      // Consider adding a visual error indicator or retry mechanism
    }
  };

  // Create references to dashboard navigation
  const navigateToPage = (page) => {
    // Use a custom event to communicate with the parent App component
    const navigationEvent = new CustomEvent('navigate', {
      detail: { page },
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch the event on the document
    document.dispatchEvent(navigationEvent);
  };

  if (loading) {
    return (
      <div className="home-page loading">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header>
        <h1>CRM Dashboard</h1>
        <p>Real-time sales and customer management insights</p>
      </header>
      
      <div className="dashboard-overview">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Leads</h3>
            <p className="stat-value">{summary.totalLeads}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <h3>Converted Deals</h3>
            <p className="stat-value">{summary.convertedDeals}</p>
            <p className="stat-secondary">
              {summary.totalLeads ? Math.round((summary.convertedDeals / summary.totalLeads) * 100) : 0}% Conversion Rate
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Scheduled Visits</h3>
            <p className="stat-value">{summary.scheduledVisits}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Visits</h3>
            <p className="stat-value">{summary.completedVisits}</p>
            <p className="stat-secondary">
              {summary.scheduledVisits ? Math.round((summary.completedVisits / summary.scheduledVisits) * 100) : 0}% Completion Rate
            </p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-container">
          <canvas id="sourceChart"></canvas>
        </div>
        <div className="chart-container">
          <canvas id="projectChart"></canvas>
        </div>
        <div className="chart-container">
          <canvas id="visitsChart"></canvas>
        </div>
      </div>
      
      <div className="recent-leads-section">
        <h2>Recent Leads</h2>
        {summary.recentLeads.length > 0 ? (
          <table className="recent-leads-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentLeads.map((lead, index) => (
                <tr key={index}>
                  <td>{new Date(lead.date).toLocaleDateString()}</td>
                  <td>{lead.name}</td>
                  <td>{lead.contact}</td>
                  <td>
                    <span className={`status-badge ${lead.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No recent leads found</p>
        )}
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => navigateToPage('telecaller')}>
            <span className="action-icon">📞</span>
            <span>View Telecaller Dashboard</span>
          </button>
          <button className="action-btn" onClick={() => navigateToPage('salesCoordinator')}>
            <span className="action-icon">👨‍💼</span>
            <span>View Sales Coordinator Dashboard</span>
          </button>
          <button className="action-btn" onClick={() => navigateToPage('salesman')}>
            <span className="action-icon">🤵</span>
            <span>View Salesman Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
