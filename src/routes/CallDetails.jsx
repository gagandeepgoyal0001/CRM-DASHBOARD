import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPhone, FaPhoneSlash, FaUser, FaClock, FaCalendarAlt, FaStickyNote, FaTag, FaChevronRight } from 'react-icons/fa';
import '../styles/callAnalytics.css';

// Mock data for a specific call
const mockCallData = {
  id: 'C-7845',
  status: 'completed',
  date: '2023-07-12',
  time: '10:45 AM',
  duration: '08:23',
  agent: {
    id: 'A-128',
    name: 'Sarah Johnson',
    department: 'Sales',
    photo: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  customer: {
    id: 'CUS-5432',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    accountType: 'Enterprise',
    history: '4 previous calls'
  },
  recording: 'call-recording-7845.mp3',
  notes: 'Customer called about upgrading their current subscription plan. Discussed pricing options and sent follow-up email with quote. Customer seemed satisfied with options presented.',
  followUp: 'Scheduled for 2023-07-19',
  tags: ['subscription upgrade', 'pricing discussion', 'follow-up required'],
  actions: ['Sent quote email', 'Added task reminder'],
  transcript: [
    { time: '00:14', speaker: 'Agent', text: 'Good morning, thank you for calling Acme Support. This is Sarah, how may I help you today?' },
    { time: '00:23', speaker: 'Customer', text: 'Hi Sarah, this is John Smith from Acme Corporation. I wanted to discuss upgrading our current subscription plan.' },
    { time: '00:35', speaker: 'Agent', text: 'Of course, Mr. Smith. I\'d be happy to discuss upgrade options with you. I see you\'re currently on our Business tier, is that correct?' },
    { time: '00:42', speaker: 'Customer', text: 'Yes, that\'s right. We\'ve been growing and need more user seats and the advanced reporting features.' },
    { time: '00:56', speaker: 'Agent', text: 'Understood. The Enterprise tier would give you those advanced reporting features plus unlimited user seats. Would you like me to explain the pricing structure?' },
    // More transcript entries would follow
  ],
  sentiment: {
    overall: 'positive',
    graph: [
      { time: '00:00', value: 0.5 },
      { time: '01:00', value: 0.7 },
      { time: '02:00', value: 0.8 },
      { time: '03:00', value: 0.6 },
      { time: '04:00', value: 0.9 },
      { time: '05:00', value: 0.7 },
      { time: '06:00', value: 0.8 },
      { time: '07:00', value: 0.9 },
      { time: '08:00', value: 0.8 },
    ]
  }
};

function CallDetails() {
  const { callId } = useParams();
  const [loading, setLoading] = useState(true);
  const [callData, setCallData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Mock API call to fetch call details
    const fetchCallDetails = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCallData(mockCallData);
        setLoading(false);
      } catch (err) {
        setError('Error fetching call details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCallDetails();
  }, [callId]);
  
  if (loading) {
    return <div className="dashboard-container loading">Loading call details...</div>;
  }
  
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container call-details-container">
      <div className="call-details-header">
        <div>
          <Link to="/call-analytics" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Analytics
          </Link>
          <h1 className="dashboard-title">Call Details - {callData.id}</h1>
          <p className="dashboard-subtitle">
            <span className={`call-status status-${callData.status}`}>{callData.status}</span>
            <span className="call-date">{callData.date} at {callData.time}</span>
            <span className="call-duration"><i className="fas fa-clock"></i> {callData.duration}</span>
          </p>
        </div>
        
        <div className="call-actions">
          <button className="action-button">
            <i className="fas fa-play"></i> Play Recording
          </button>
          <button className="action-button">
            <i className="fas fa-download"></i> Download
          </button>
          <button className="action-button">
            <i className="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>
      
      <div className="call-details-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          Transcript
        </button>
        <button 
          className={`tab-button ${activeTab === 'sentiment' ? 'active' : ''}`}
          onClick={() => setActiveTab('sentiment')}
        >
          Sentiment Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions & Notes
        </button>
      </div>
      
      <div className="call-details-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="call-parties">
              <div className="call-party agent-details">
                <div className="party-header">Agent</div>
                <div className="party-info">
                  <img src={callData.agent.photo} alt={callData.agent.name} className="party-photo" />
                  <div className="party-data">
                    <div className="party-name">{callData.agent.name}</div>
                    <div className="party-id">ID: {callData.agent.id}</div>
                    <div className="party-details">{callData.agent.department}</div>
                    <Link to={`/agent-profile/${callData.agent.id}`} className="view-profile-link">View Full Profile</Link>
                  </div>
                </div>
              </div>
              
              <div className="call-direction">
                <i className="fas fa-phone"></i>
              </div>
              
              <div className="call-party customer-details">
                <div className="party-header">Customer</div>
                <div className="party-info">
                  <div className="party-photo customer-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="party-data">
                    <div className="party-name">{callData.customer.name}</div>
                    <div className="party-id">ID: {callData.customer.id}</div>
                    <div className="party-details">
                      <div>{callData.customer.company}</div>
                      <div>{callData.customer.email}</div>
                      <div>{callData.customer.phone}</div>
                      <div>Account: {callData.customer.accountType}</div>
                      <div>History: {callData.customer.history}</div>
                    </div>
                    <Link to={`/customer-profile/${callData.customer.id}`} className="view-profile-link">View Full Profile</Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="call-details-summary">
              <div className="summary-section">
                <h3 className="section-title">Call Summary</h3>
                <p className="call-notes">{callData.notes}</p>
              </div>
              
              <div className="summary-section">
                <h3 className="section-title">Tags</h3>
                <div className="tag-container">
                  {callData.tags.map((tag, index) => (
                    <span key={index} className="call-tag">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="summary-section">
                <h3 className="section-title">Follow-up</h3>
                <div className="follow-up-info">
                  <i className="fas fa-calendar-alt"></i>
                  <span>{callData.followUp}</span>
                </div>
              </div>
              
              <div className="summary-section">
                <h3 className="section-title">Actions Taken</h3>
                <ul className="action-list">
                  {callData.actions.map((action, index) => (
                    <li key={index} className="action-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'transcript' && (
          <div className="tab-content">
            <div className="transcript-controls">
              <button className="control-button">
                <i className="fas fa-search"></i> Search Transcript
              </button>
              <button className="control-button">
                <i className="fas fa-download"></i> Export
              </button>
            </div>
            
            <div className="transcript-container">
              {callData.transcript.map((entry, index) => (
                <div 
                  key={index} 
                  className={`transcript-entry ${entry.speaker.toLowerCase() === 'agent' ? 'agent-entry' : 'customer-entry'}`}
                >
                  <div className="transcript-time">{entry.time}</div>
                  <div className="transcript-speaker">{entry.speaker}</div>
                  <div className="transcript-text">{entry.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'sentiment' && (
          <div className="tab-content">
            <div className="sentiment-summary">
              <div className="sentiment-indicator">
                <div className="sentiment-label">Overall Sentiment</div>
                <div className={`sentiment-value sentiment-${callData.sentiment.overall}`}>
                  {callData.sentiment.overall.charAt(0).toUpperCase() + callData.sentiment.overall.slice(1)}
                </div>
              </div>
              
              <div className="sentiment-chart">
                <h3 className="section-title">Sentiment Timeline</h3>
                <div className="chart-area">
                  {/* This would be replaced with an actual chart component */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px', 
                    backgroundColor: '#f7fafc',
                    borderRadius: '4px',
                    color: '#718096'
                  }}>
                    Sentiment graph would appear here
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sentiment-insights">
              <h3 className="section-title">Key Insights</h3>
              <div className="insights-list">
                <div className="insight-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>Customer showed positive reaction to upgrade pricing options.</span>
                </div>
                <div className="insight-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>Sentiment improved significantly after discussing advanced reporting features.</span>
                </div>
                <div className="insight-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>No detected negative reactions throughout the call.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'actions' && (
          <div className="tab-content">
            <div className="actions-grid">
              <div className="actions-section">
                <h3 className="section-title">Notes</h3>
                <div className="notes-container">
                  <textarea 
                    className="notes-input" 
                    defaultValue={callData.notes}
                    placeholder="Add or edit notes about this call..."
                  ></textarea>
                  <button className="save-button">
                    <i className="fas fa-save"></i> Save Notes
                  </button>
                </div>
              </div>
              
              <div className="actions-section">
                <h3 className="section-title">Add Action</h3>
                <div className="action-buttons">
                  <button className="action-button-large">
                    <i className="fas fa-envelope"></i>
                    Send Email
                  </button>
                  <button className="action-button-large">
                    <i className="fas fa-tasks"></i>
                    Create Task
                  </button>
                  <button className="action-button-large">
                    <i className="fas fa-calendar-plus"></i>
                    Schedule Follow-up
                  </button>
                  <button className="action-button-large">
                    <i className="fas fa-file-alt"></i>
                    Create Quote
                  </button>
                </div>
              </div>
              
              <div className="actions-section full-width">
                <h3 className="section-title">Action History</h3>
                <div className="action-history">
                  <div className="history-item">
                    <div className="history-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="history-details">
                      <div className="history-title">Email Sent: Quote for Enterprise Plan</div>
                      <div className="history-meta">By Sarah Johnson on July 12, 2023 at 11:02 AM</div>
                      <div className="history-content">Sent pricing quote for Enterprise plan upgrade with custom discount.</div>
                    </div>
                  </div>
                  
                  <div className="history-item">
                    <div className="history-icon">
                      <i className="fas fa-tasks"></i>
                    </div>
                    <div className="history-details">
                      <div className="history-title">Task Created: Follow up on quote</div>
                      <div className="history-meta">By Sarah Johnson on July 12, 2023 at 11:05 AM</div>
                      <div className="history-content">Set reminder to follow up on quote by July 19, 2023.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CallDetails; 