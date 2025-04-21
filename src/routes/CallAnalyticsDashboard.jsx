import React, { useState, useEffect, useRef } from 'react';
import { format, subDays } from 'date-fns';
import Chart from 'chart.js/auto';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../styles/callAnalytics.css';

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Constants for Google Drive integration (adjust as needed)
const CALL_LOG_SHEET_URL = "https://docs.google.com/spreadsheets/d/example-sheet-id";
const RECORDINGS_FOLDER_URL = "https://drive.google.com/drive/folders/example-folder-id";

const CallAnalyticsDashboard = () => {
  // State for call data and UI
  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [filter, setFilter] = useState({
    telecaller: 'all',
    search: ''
  });
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    missedCalls: 0,
    averageDuration: 0,
    callsPerDay: 0,
    resolutionRate: 0
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [callType, setCallType] = useState('all');
  const [telecaller, setTelecaller] = useState('all');

  // Refs for charts
  const callTypeChartRef = useRef(null);
  const dailyCallsChartRef = useRef(null);
  const callDurationChartRef = useRef(null);
  const callTypeChartInstance = useRef(null);
  const dailyCallsChartInstance = useRef(null);
  const callDurationChartInstance = useRef(null);

  // Telecaller list (would typically come from API)
  const telecallers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Williams' }
  ];

  // Function to fetch call data (using mock data for now)
  const fetchCallData = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/call-logs');
      // const data = await response.json();
      
      // For demo purposes, generate mock data
      const mockData = generateMockCallData(dateRange);
      setCallData(mockData);
      
      // Calculate metrics
      calculateMetrics(mockData);
      setError(null);
    } catch (err) {
      console.error('Error fetching call data:', err);
      setError('Failed to load call analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock call data for demonstration
  const generateMockCallData = (dateRange) => {
    const mockData = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const callTypes = ['incoming', 'outgoing', 'missed', 'did not connect'];
    const callStatuses = ['completed', 'follow-up needed', 'resolved', 'transferred'];
    
    for (let i = 0; i < dayDiff * 10; i++) {
      const randDay = Math.floor(Math.random() * dayDiff);
      const callDate = new Date(startDate);
      callDate.setDate(callDate.getDate() + randDay);
      
      const hours = Math.floor(Math.random() * 10) + 8; // 8am to 6pm
      const minutes = Math.floor(Math.random() * 60);
      callDate.setHours(hours, minutes);
      
      const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
      const duration = callType === 'missed' || callType === 'did not connect' 
        ? 0 
        : Math.floor(Math.random() * 900) + 60; // 1-15 minutes
      
      mockData.push({
        id: i + 1,
        date: format(callDate, 'yyyy-MM-dd'),
        time: format(callDate, 'HH:mm'),
        phoneNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        customerName: `Customer ${i + 1}`,
        callType: callType,
        duration: duration,
        telecaller: telecallers[Math.floor(Math.random() * telecallers.length)].name,
        status: callStatuses[Math.floor(Math.random() * callStatuses.length)],
        recordingUrl: Math.random() > 0.7 ? `recording_${i + 1}.mp3` : null
      });
    }
    
    return mockData;
  };

  // Calculate call metrics based on filtered data
  const calculateMetrics = (data) => {
    const filteredData = filterCallData(data);
    
    const totalCalls = filteredData.length;
    const incomingCalls = filteredData.filter(call => call.callType === 'incoming').length;
    const outgoingCalls = filteredData.filter(call => call.callType === 'outgoing').length;
    const missedCalls = filteredData.filter(call => call.callType === 'missed').length;
    
    const completedCalls = filteredData.filter(call => call.status === 'completed' || call.status === 'resolved').length;
    const resolutionRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;
    
    const validDurations = filteredData.filter(call => call.duration > 0);
    const totalDuration = validDurations.reduce((sum, call) => sum + call.duration, 0);
    const averageDuration = validDurations.length > 0 ? totalDuration / validDurations.length : 0;
    
    // Calculate calls per day
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const callsPerDay = totalCalls / dayDiff;
    
    setMetrics({
      totalCalls,
      incomingCalls,
      outgoingCalls,
      missedCalls,
      averageDuration,
      callsPerDay,
      resolutionRate
    });
  };

  // Filter call data based on current filters
  const filterCallData = (data = callData) => {
    return data.filter(call => {
      // Date range filter
      const callDate = new Date(call.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59); // Include the entire end day
      
      const dateInRange = callDate >= startDate && callDate <= endDate;
      
      // Telecaller filter
      const telecallerMatch = filter.telecaller === 'all' || call.telecaller === filter.telecaller;
      
      // Search filter (phone number, customer name)
      const searchTerm = filter.search.toLowerCase();
      const searchMatch = searchTerm === '' || 
        call.phoneNumber.includes(searchTerm) || 
        call.customerName.toLowerCase().includes(searchTerm);
      
      return dateInRange && telecallerMatch && searchMatch;
    });
  };

  // Initialize charts
  const initializeCharts = () => {
    const filteredData = filterCallData();
    
    // Call Type Distribution Chart
    if (callTypeChartRef.current) {
      const callTypeData = {
        incoming: filteredData.filter(call => call.callType === 'incoming').length,
        outgoing: filteredData.filter(call => call.callType === 'outgoing').length,
        missed: filteredData.filter(call => call.callType === 'missed').length,
        didNotConnect: filteredData.filter(call => call.callType === 'did not connect').length
      };

      // Destroy existing chart if it exists
      if (callTypeChartInstance.current) {
        callTypeChartInstance.current.destroy();
      }
      
      callTypeChartInstance.current = new Chart(callTypeChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Incoming', 'Outgoing', 'Missed', 'Did Not Connect'],
          datasets: [{
            data: [callTypeData.incoming, callTypeData.outgoing, callTypeData.missed, callTypeData.didNotConnect],
            backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FFC107']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Call Type Distribution'
            }
          }
        }
      });
    }
    
    // Daily Calls Chart
    if (dailyCallsChartRef.current) {
      // Group calls by date
      const dailyCalls = {};
      filteredData.forEach(call => {
        if (!dailyCalls[call.date]) {
          dailyCalls[call.date] = 0;
        }
        dailyCalls[call.date]++;
      });
      
      // Sort dates
      const sortedDates = Object.keys(dailyCalls).sort();
      
      // Destroy existing chart if it exists
      if (dailyCallsChartInstance.current) {
        dailyCallsChartInstance.current.destroy();
      }
      
      dailyCallsChartInstance.current = new Chart(dailyCallsChartRef.current, {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [{
            label: 'Number of Calls',
            data: sortedDates.map(date => dailyCalls[date]),
            borderColor: '#5e35b1',
            backgroundColor: 'rgba(94, 53, 177, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Daily Call Volume'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Calls'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    }
    
    // Call Duration Chart
    if (callDurationChartRef.current) {
      // Group call durations into ranges
      const durationRanges = {
        '<1min': 0,
        '1-3min': 0,
        '3-5min': 0,
        '5-10min': 0,
        '>10min': 0
      };
      
      filteredData.forEach(call => {
        const duration = call.duration;
        if (duration === 0) return; // Skip missed calls
        
        if (duration < 60) {
          durationRanges['<1min']++;
        } else if (duration < 180) {
          durationRanges['1-3min']++;
        } else if (duration < 300) {
          durationRanges['3-5min']++;
        } else if (duration < 600) {
          durationRanges['5-10min']++;
        } else {
          durationRanges['>10min']++;
        }
      });

      // Destroy existing chart if it exists
      if (callDurationChartInstance.current) {
        callDurationChartInstance.current.destroy();
      }
      
      callDurationChartInstance.current = new Chart(callDurationChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(durationRanges),
          datasets: [{
            label: 'Number of Calls',
            data: Object.values(durationRanges),
            backgroundColor: '#5e35b1'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Call Duration Distribution'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Calls'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Duration Range'
              }
            }
          }
        }
      });
    }
  };

  // Handle filter changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleTelecallerChange = (e) => {
    setFilter(prev => ({ ...prev, telecaller: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
  };

  const handleApplyFilters = () => {
    fetchCallData();
  };

  const handleResetFilters = () => {
    setDateRange({
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    });
    setFilter({
      telecaller: 'all',
      search: ''
    });
  };

  // Format seconds to MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Effect to fetch data on initial load
  useEffect(() => {
    fetchCallData();
  }, []);

  // Effect to update charts when data changes
  useEffect(() => {
    if (!loading && callData.length > 0) {
      initializeCharts();
    }
  }, [loading, callData, filter, dateRange]);

  // Filtered call data for display
  const filteredCallData = filterCallData();

  useEffect(() => {
    // Function to fetch analytics data based on filters
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = generateMockAnalyticsData(timeRange, callType, telecaller);
        setAnalyticsData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, callType, telecaller]);

  // Function to generate mock analytics data based on filters
  const generateMockAnalyticsData = (timeRange, callType, telecaller) => {
    // Time labels based on selected range
    let timeLabels;
    switch (timeRange) {
      case 'day':
        timeLabels = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
        break;
      case 'week':
        timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        timeLabels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
        break;
      default:
        timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    // Generate random data based on filters
    return {
      summary: {
        totalCalls: Math.floor(Math.random() * 500) + 300,
        avgDuration: Math.floor(Math.random() * 5) + 3,
        successRate: Math.floor(Math.random() * 30) + 65,
        conversionRate: Math.floor(Math.random() * 15) + 10
      },
      callVolume: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Total Calls',
            data: timeLabels.map(() => Math.floor(Math.random() * 50) + 20),
            backgroundColor: 'rgba(37, 99, 235, 0.6)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      callDuration: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Average Call Duration (min)',
            data: timeLabels.map(() => Math.floor(Math.random() * 5) + 2 + Math.random()),
            fill: false,
            borderColor: 'rgba(16, 185, 129, 1)',
            tension: 0.1
          }
        ]
      },
      callTypes: {
        labels: ['Inbound', 'Outbound', 'Missed'],
        datasets: [
          {
            data: [
              Math.floor(Math.random() * 50) + 30,
              Math.floor(Math.random() * 70) + 40,
              Math.floor(Math.random() * 20) + 5
            ],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(239, 68, 68, 0.7)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      callOutcomes: {
        labels: ['Successful', 'Callback Scheduled', 'No Answer', 'Not Interested', 'Wrong Number'],
        datasets: [
          {
            data: [
              Math.floor(Math.random() * 30) + 40,
              Math.floor(Math.random() * 20) + 15,
              Math.floor(Math.random() * 15) + 10,
              Math.floor(Math.random() * 15) + 5,
              Math.floor(Math.random() * 10) + 2
            ],
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(107, 114, 128, 0.7)'
            ],
            borderWidth: 1
          }
        ]
      },
      recentCalls: [
        {
          id: 'call1',
          customer: 'John Smith',
          phone: '+1 555-123-4567',
          time: '10:30 AM',
          duration: '4:22',
          type: 'outgoing',
          status: 'success'
        },
        {
          id: 'call2',
          customer: 'Sarah Johnson',
          phone: '+1 555-987-6543',
          time: '11:15 AM',
          duration: '2:45',
          type: 'incoming',
          status: 'success'
        },
        {
          id: 'call3',
          customer: 'Michael Brown',
          phone: '+1 555-456-7890',
          time: '12:05 PM',
          duration: '5:10',
          type: 'outgoing',
          status: 'pending'
        },
        {
          id: 'call4',
          customer: 'Emily Davis',
          phone: '+1 555-789-0123',
          time: '1:30 PM',
          duration: '0:15',
          type: 'missed',
          status: 'failed'
        },
        {
          id: 'call5',
          customer: 'David Wilson',
          phone: '+1 555-321-6547',
          time: '2:45 PM',
          duration: '3:22',
          type: 'outgoing',
          status: 'success'
        }
      ],
      telecallerPerformance: [
        {
          name: 'Alex Turner',
          calls: 78,
          avgDuration: '3:45',
          successRate: '72%',
          salesConverted: 12
        },
        {
          name: 'Jessica Lee',
          calls: 85,
          avgDuration: '4:12',
          successRate: '68%',
          salesConverted: 15
        },
        {
          name: 'Mark Johnson',
          calls: 65,
          avgDuration: '3:10',
          successRate: '75%',
          salesConverted: 10
        },
        {
          name: 'Sophia Chen',
          calls: 92,
          avgDuration: '2:58',
          successRate: '81%',
          salesConverted: 18
        }
      ]
    };
  };

  // Generate options for bar and line charts
  const generateChartOptions = (title) => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  if (loading) {
    return <div className="dashboard-container loading">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="dashboard-container error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="detail-header">
        <h1 className="dashboard-title">Call Analytics Dashboard</h1>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="timeRange">Time Period</label>
          <select 
            id="timeRange" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="btn btn-secondary"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="callType">Call Type</label>
          <select 
            id="callType" 
            value={callType} 
            onChange={(e) => setCallType(e.target.value)}
            className="btn btn-secondary"
          >
            <option value="all">All Calls</option>
            <option value="inbound">Inbound Only</option>
            <option value="outbound">Outbound Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="telecaller">Telecaller</label>
          <select 
            id="telecaller" 
            value={telecaller} 
            onChange={(e) => setTelecaller(e.target.value)}
            className="btn btn-secondary"
          >
            <option value="all">All Telecallers</option>
            <option value="Alex Turner">Alex Turner</option>
            <option value="Jessica Lee">Jessica Lee</option>
            <option value="Mark Johnson">Mark Johnson</option>
            <option value="Sophia Chen">Sophia Chen</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Total Calls</h3>
          <div className="metric-value">{analyticsData.summary.totalCalls}</div>
          <div className="metric-trend trend-up">
            <span>↑ 12% vs previous period</span>
          </div>
        </div>
        <div className="metric-card">
          <h3>Avg. Call Duration</h3>
          <div className="metric-value">{analyticsData.summary.avgDuration} min</div>
          <div className="metric-trend trend-up">
            <span>↑ 5% vs previous period</span>
          </div>
        </div>
        <div className="metric-card">
          <h3>Success Rate</h3>
          <div className="metric-value">{analyticsData.summary.successRate}%</div>
          <div className="metric-trend trend-up">
            <span>↑ 3% vs previous period</span>
          </div>
        </div>
        <div className="metric-card">
          <h3>Conversion Rate</h3>
          <div className="metric-value">{analyticsData.summary.conversionRate}%</div>
          <div className="metric-trend trend-down">
            <span>↓ 2% vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <Bar 
            data={analyticsData.callVolume} 
            options={generateChartOptions('Call Volume Over Time')} 
          />
        </div>
        <div className="chart-container">
          <Line 
            data={analyticsData.callDuration} 
            options={generateChartOptions('Average Call Duration')} 
          />
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <Doughnut 
            data={analyticsData.callTypes} 
            options={pieOptions} 
          />
          <h3>Call Types Distribution</h3>
        </div>
        <div className="chart-container">
          <Pie 
            data={analyticsData.callOutcomes} 
            options={pieOptions} 
          />
          <h3>Call Outcomes</h3>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="detail-section">
        <h2 className="section-title">Recent Calls</h2>
        <div className="dashboard-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.recentCalls.map((call) => (
                <tr key={call.id}>
                  <td>{call.customer}</td>
                  <td>{call.phone}</td>
                  <td>{call.time}</td>
                  <td>{call.duration}</td>
                  <td>
                    <span className={`call-type ${call.type}`}>
                      {call.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-cell status-${call.status}`}>
                      {call.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/call-details/${call.id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telecaller Performance Section */}
      <div className="detail-section">
        <h2 className="section-title">Telecaller Performance</h2>
        <div className="dashboard-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Calls</th>
                <th>Avg. Duration</th>
                <th>Success Rate</th>
                <th>Sales Converted</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.telecallerPerformance.map((performer, index) => (
                <tr key={index}>
                  <td>{performer.name}</td>
                  <td>{performer.calls}</td>
                  <td>{performer.avgDuration}</td>
                  <td>{performer.successRate}</td>
                  <td>{performer.salesConverted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallAnalyticsDashboard; 