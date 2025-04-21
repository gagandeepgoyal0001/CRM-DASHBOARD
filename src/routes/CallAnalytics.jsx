import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/callAnalytics.css';

// Mock data for the analytics
const mockAnalyticsData = {
  summary: {
    totalCalls: { value: 412, change: 8.5 },
    avgDuration: { value: '5:23', change: 2.1 },
    conversionRate: { value: '24%', change: -1.2 },
    callsPerAgent: { value: 31, change: 5.7 },
  },
  topPerformers: [
    { id: 1, name: 'Sarah Johnson', calls: 52, conversions: 18 },
    { id: 2, name: 'Michael Chang', calls: 48, conversions: 15 },
    { id: 3, name: 'Priya Patel', calls: 45, conversions: 14 },
    { id: 4, name: 'David Wilson', calls: 42, conversions: 12 },
    { id: 5, name: 'Emma Rodriguez', calls: 40, conversions: 11 },
  ],
  recentCalls: [
    { id: 'C-7845', time: '10 minutes ago', customer: 'John Smith', result: 'successful' },
    { id: 'C-7844', time: '25 minutes ago', customer: 'Lisa Brown', result: 'missed' },
    { id: 'C-7843', time: '1 hour ago', customer: 'Robert Chen', result: 'successful' },
    { id: 'C-7842', time: '2 hours ago', customer: 'Maria Garcia', result: 'ongoing' },
    { id: 'C-7841', time: '3 hours ago', customer: 'James Taylor', result: 'successful' },
  ]
};

function CallAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [activeMetric, setActiveMetric] = useState('calls');
  
  useEffect(() => {
    // Mock API call to fetch analytics data
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(mockAnalyticsData);
        setLoading(false);
      } catch (err) {
        setError('Error fetching analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  if (loading) {
    return <div className="dashboard-container loading">Loading analytics data...</div>;
  }
  
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Call Analytics</h1>
      <p className="dashboard-subtitle">Monitor call performance and agent productivity</p>
      
      <div className="analytics-header">
        <div className="analytics-controls">
          <div className="control-group">
            <label className="control-label">Time Range</label>
            <select 
              className="control-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="control-label">Team</label>
            <select className="control-select">
              <option value="all">All Teams</option>
              <option value="sales">Sales Team</option>
              <option value="support">Support Team</option>
              <option value="account">Account Management</option>
            </select>
          </div>
        </div>
        
        <button className="export-button">
          <i className="fas fa-download"></i>
          Export Report
        </button>
      </div>
      
      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">Total Calls</div>
          <div className="summary-card-value">{data.summary.totalCalls.value}</div>
          <div className={`summary-card-change ${data.summary.totalCalls.change > 0 ? 'positive-change' : 'negative-change'}`}>
            <i className={`fas fa-${data.summary.totalCalls.change > 0 ? 'arrow-up' : 'arrow-down'}`}></i>
            {Math.abs(data.summary.totalCalls.change)}% from last period
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-title">Average Duration</div>
          <div className="summary-card-value">{data.summary.avgDuration.value}</div>
          <div className={`summary-card-change ${data.summary.avgDuration.change > 0 ? 'positive-change' : 'negative-change'}`}>
            <i className={`fas fa-${data.summary.avgDuration.change > 0 ? 'arrow-up' : 'arrow-down'}`}></i>
            {Math.abs(data.summary.avgDuration.change)}% from last period
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-title">Conversion Rate</div>
          <div className="summary-card-value">{data.summary.conversionRate.value}</div>
          <div className={`summary-card-change ${data.summary.conversionRate.change > 0 ? 'positive-change' : 'negative-change'}`}>
            <i className={`fas fa-${data.summary.conversionRate.change > 0 ? 'arrow-up' : 'arrow-down'}`}></i>
            {Math.abs(data.summary.conversionRate.change)}% from last period
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-title">Calls per Agent</div>
          <div className="summary-card-value">{data.summary.callsPerAgent.value}</div>
          <div className={`summary-card-change ${data.summary.callsPerAgent.change > 0 ? 'positive-change' : 'negative-change'}`}>
            <i className={`fas fa-${data.summary.callsPerAgent.change > 0 ? 'arrow-up' : 'arrow-down'}`}></i>
            {Math.abs(data.summary.callsPerAgent.change)}% from last period
          </div>
        </div>
      </div>
      
      {/* Metrics Selector */}
      <div className="metrics-selector">
        <button 
          className={`metric-button ${activeMetric === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveMetric('calls')}
        >
          Call Volume
        </button>
        <button 
          className={`metric-button ${activeMetric === 'duration' ? 'active' : ''}`}
          onClick={() => setActiveMetric('duration')}
        >
          Call Duration
        </button>
        <button 
          className={`metric-button ${activeMetric === 'conversion' ? 'active' : ''}`}
          onClick={() => setActiveMetric('conversion')}
        >
          Conversion Rate
        </button>
        <button 
          className={`metric-button ${activeMetric === 'satisfaction' ? 'active' : ''}`}
          onClick={() => setActiveMetric('satisfaction')}
        >
          Customer Satisfaction
        </button>
      </div>
      
      {/* Chart sections */}
      <div className="chart-sections">
        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-title">Call Performance Trends</div>
            <select className="control-select">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="chart-area">
            {/* This would be replaced with an actual chart component */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              backgroundColor: '#f7fafc',
              borderRadius: '4px',
              color: '#718096'
            }}>
              Chart visualization would appear here
            </div>
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-title">Call Distribution</div>
          </div>
          <div className="chart-area">
            {/* This would be replaced with an actual chart component */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              backgroundColor: '#f7fafc',
              borderRadius: '4px',
              color: '#718096'
            }}>
              Pie chart visualization would appear here
            </div>
          </div>
        </div>
      </div>
      
      {/* Details grid */}
      <div className="detail-grid">
        <div className="detail-card">
          <h3 className="detail-card-title">Top Performers</h3>
          <div>
            {data.topPerformers.map((performer, index) => (
              <div className="detail-list-item" key={performer.id}>
                <div className={`performer-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>{index + 1}</div>
                <div className="performer-details">
                  <div className="performer-name">{performer.name}</div>
                  <div className="performer-stat">{performer.calls} calls, {performer.conversions} conversions</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/team-performance" className="view-all-link">View All Performers</Link>
        </div>
        
        <div className="detail-card">
          <h3 className="detail-card-title">Recent Calls</h3>
          <div>
            {data.recentCalls.map(call => (
              <div className="detail-list-item" key={call.id}>
                <div className="performer-details">
                  <div className="recent-call-time">{call.time}</div>
                  <div className="recent-call-details">
                    <span className="recent-call-customer">{call.customer}</span>
                    <span className={`recent-call-result result-${call.result}`}>
                      {call.result.charAt(0).toUpperCase() + call.result.slice(1)}
                    </span>
                  </div>
                </div>
                <Link to={`/call-details/${call.id}`}>
                  <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
            ))}
          </div>
          <Link to="/call-history" className="view-all-link">View All Calls</Link>
        </div>
      </div>
    </div>
  );
}

export default CallAnalytics; 