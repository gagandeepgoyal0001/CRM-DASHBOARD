// src/scripts/TelecallerDashboard.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';
import '../styles/telecallerDashboard.css';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQL2FFpsyRDa6Sv2rj8qjIlYBkxcXDJbV4nwdLxxIeegJj9KG8XTZdwAD7C4gr56uJhCvada8qoj-x7/pub?output=csv';

function TelecallerDashboard() {
  // States for CSV data and header mapping
  const [dataRows, setDataRows] = useState([]);
  const [allIdx, setAllIdx] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States for computed metrics
  const [telecallerCounts, setTelecallerCounts] = useState({});
  const [channelCounts, setChannelCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [propertyNeedsCounts, setPropertyNeedsCounts] = useState({});
  const [projectInterestsCounts, setProjectInterestsCounts] = useState({});
  const [positiveFeedbackCount, setPositiveFeedbackCount] = useState(0);
  const [negativeFeedbackCount, setNegativeFeedbackCount] = useState(0);
  const [satisfiedCount, setSatisfiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [visitDoneCount, setVisitDoneCount] = useState(0);
  const [plannedVisitCount, setPlannedVisitCount] = useState(0);
  const [visitDoneCombined, setVisitDoneCombined] = useState(0);

  // States for search and details toggling
  const [propertySearch, setPropertySearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [fullDetails, setFullDetails] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [propertyNeedsFilter, setPropertyNeedsFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [visitFilter, setVisitFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Refs for Chart.js instances
  const visitDoneTotalChartRef = useRef(null);
  const visitDoneScheduledChartRef = useRef(null);
  const feedbackChartRef = useRef(null);
  const leadTypesChartRef = useRef(null);

  // Fetch CSV data and update metrics
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const rows = csvText.trim().split('\n').map((row) => row.split(','));
      const headerIndex = rows.findIndex((row) => row.includes('DATE/TIME'));
      if (headerIndex === -1) throw new Error('Header row not found.');

      const headers = rows[headerIndex].map((h) => h.trim());
      const data = rows.slice(headerIndex + 1);

      // Build header index mapping
      const idx = {
        dateTime: headers.indexOf('DATE/TIME'),
        name: headers.indexOf('NAME'),
        number: headers.indexOf('NUMBER'),
        email: headers.indexOf('EMAIL'),
        city: headers.indexOf('CITY'),
        occupation: headers.indexOf('OCCUPATION'),
        dealerInvestorEnduser: headers.indexOf('Dealer / Invester/ Enduser'),
        channel: headers.indexOf('Google add / facebook/ Instagram/ Flex'),
        telecaller: headers.indexOf('REACHED BY WHICH TELECALLER'),
        planningVisit: headers.indexOf('PLANNING FOR VISIT'),
        comment: headers.indexOf('Comment/feedback'),
        status: headers.indexOf('Status'),
        projectMap: headers.indexOf('PROJECT MAP/ PAYMENT PLAN SENT ?'),
        photoVideo: headers.indexOf('PHOTO/ VIDEO'),
        visitDate: headers.indexOf('Visit Date'),
        visitDone: headers.indexOf('Visit done'),
        postVisitFeedback: headers.indexOf('POST-VISIT FEEDBACK'),
        propertyNeed: headers.indexOf('NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi'),
        projectInterest: headers.indexOf('Virat Greens/ Virat Crown/ Both Projects'),
        plotSize: headers.indexOf('Plot Size Requirement'),
        propertyNumber: headers.indexOf('PROPERTY NUMBER'),
        firstVisitStatus: headers.indexOf('1st Visit Status'),
        secondVisitStatus: headers.indexOf('2nd Visit Status'),
        thirdVisitStatus: headers.indexOf('3rd Visit Status'),
        firstVisitDate: headers.indexOf('1st Visit Date'),
        secondVisitDate: headers.indexOf('2nd Visit Date'),
        thirdVisitDate: headers.indexOf('3rd Visit Date'),
      };
      setAllIdx(idx);
      setDataRows(data);

      // Reset counters
      let teleCount = {};
      let chanCount = {};
      let statCount = {};
      let propNeedCount = {};
      let projIntCount = {};
      let posCount = 0,
        negCount = 0,
        satCount = 0,
        penCount = 0;
      let doneCount1st = 0;
      let combinedDone = 0;
      let scheduledCount = 0;

      // For lead types (from Status)
      let leadTypeCounts = {
        'Good Lead': 0,
        'Hot Lead': 0,
        'Transferred to Sales Coordinator': 0,
        'Junk Lead': 0,
        'Transferred to Salesman': 0,
      };

      data.forEach((row) => {
        const tele = row[idx.telecaller]?.trim();
        if (tele) teleCount[tele] = (teleCount[tele] || 0) + 1;
        const ch = row[idx.channel]?.trim();
        if (ch) chanCount[ch] = (chanCount[ch] || 0) + 1;
        const st = row[idx.status]?.trim();
        if (st) {
          statCount[st] = (statCount[st] || 0) + 1;
          if (leadTypeCounts.hasOwnProperty(st)) {
            leadTypeCounts[st]++;
          }
        }
        const need = row[idx.propertyNeed]?.trim();
        if (need) propNeedCount[need] = (propNeedCount[need] || 0) + 1;
        const proj = row[idx.projectInterest]?.trim();
        if (proj) projIntCount[proj] = (projIntCount[proj] || 0) + 1;

        const feedback = row[idx.postVisitFeedback]?.trim().toLowerCase();
        if (feedback === 'positive') posCount++;
        if (feedback === 'negative') negCount++;
        if (feedback === 'satisfied') satCount++;
        if (feedback === 'pending') penCount++;

        if (
          row[idx.firstVisitStatus] &&
          row[idx.firstVisitStatus].trim().toLowerCase() === 'done'
        ) {
          doneCount1st++;
        }
        if (
          (row[idx.firstVisitStatus] &&
            row[idx.firstVisitStatus].trim().toLowerCase() === 'done') ||
          (row[idx.secondVisitStatus] &&
            row[idx.secondVisitStatus].trim().toLowerCase() === 'done') ||
          (row[idx.thirdVisitStatus] &&
            row[idx.thirdVisitStatus].trim().toLowerCase() === 'done')
        ) {
          combinedDone++;
        }
        if (
          (row[idx.firstVisitDate] && row[idx.firstVisitDate].trim() !== '') ||
          (row[idx.secondVisitDate] && row[idx.secondVisitDate].trim() !== '') ||
          (row[idx.thirdVisitDate] && row[idx.thirdVisitDate].trim() !== '')
        ) {
          scheduledCount++;
        }
      });

      setTelecallerCounts(teleCount);
      setChannelCounts(chanCount);
      setStatusCounts({ ...statCount, leadTypes: leadTypeCounts });
      setPropertyNeedsCounts(propNeedCount);
      setProjectInterestsCounts(projIntCount);
      setPositiveFeedbackCount(posCount);
      setNegativeFeedbackCount(negCount);
      setSatisfiedCount(satCount);
      setPendingCount(penCount);
      setVisitDoneCount(doneCount1st);
      setPlannedVisitCount(scheduledCount);
      setVisitDoneCombined(combinedDone);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      setErrorMsg('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount and refresh every 60 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Render charts using Chart.js
  useEffect(() => {
    // Chart 1: Visit Done / Total Customers (%)
    const totalCustomers = dataRows.length;
    const visitDonePercent =
      totalCustomers > 0 ? ((visitDoneCount / totalCustomers) * 100).toFixed(1) : 0;
    const ctx1 = document.getElementById('visitDoneTotalChart')?.getContext('2d');
    if (ctx1) {
      if (visitDoneTotalChartRef.current) visitDoneTotalChartRef.current.destroy();
      visitDoneTotalChartRef.current = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Visits Done', 'Pending'],
          datasets: [
            {
              data: [visitDoneCount, totalCustomers - visitDoneCount],
              backgroundColor: ['#42c2f5', '#f5aa42'],
              borderColor: ['#42c2f5', '#f5aa42'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Visit Done / Total: ${visitDonePercent}%`,
              font: {
                size: 16
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.formattedValue || '';
                  return `${label}: ${value} (${Math.round((context.raw / totalCustomers) * 100)}%)`;
                }
              }
            }
          },
        },
      });
    }

    // Chart 2: Visit Done / Scheduled (%)
    const visitScheduledPercent =
      plannedVisitCount > 0 ? ((visitDoneCombined / plannedVisitCount) * 100).toFixed(1) : 0;
    const ctx2 = document.getElementById('visitDoneScheduledChart')?.getContext('2d');
    if (ctx2) {
      if (visitDoneScheduledChartRef.current) visitDoneScheduledChartRef.current.destroy();
      visitDoneScheduledChartRef.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Scheduled/Pending'],
          datasets: [
            {
              data: [visitDoneCombined, plannedVisitCount - visitDoneCombined],
              backgroundColor: ['#4287f5', '#f5aa42'],
              borderColor: ['#4287f5', '#f5aa42'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Visit Completion Rate: ${visitScheduledPercent}%`,
              font: {
                size: 16
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.formattedValue || '';
                  return `${label}: ${value} (${Math.round((context.raw / plannedVisitCount) * 100)}%)`;
                }
              }
            }
          },
        },
      });
    }

    // Chart 3: Lead Types Distribution
    const ctx3 = document.getElementById('leadTypesChart')?.getContext('2d');
    if (ctx3 && statusCounts.leadTypes) {
      if (leadTypesChartRef.current) leadTypesChartRef.current.destroy();
      const leadTypeLabels = Object.keys(statusCounts.leadTypes);
      const leadTypeValues = Object.values(statusCounts.leadTypes);
      leadTypesChartRef.current = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: leadTypeLabels,
          datasets: [
            {
              label: 'Count',
              data: leadTypeValues,
              backgroundColor: [
                '#4287f5', '#f54242', '#42f582', '#f5de42', '#8042f5'
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Lead Types Distribution',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Leads'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Lead Type'
              }
            }
          }
        },
      });
    }
  }, [
    dataRows,
    visitDoneCount,
    plannedVisitCount,
    visitDoneCombined,
    statusCounts,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setPropertySearch('');
    setPhoneSearch('');
    setStatusFilter('');
    setTelecallerFilter('');
    setChannelFilter('');
    setPropertyNeedsFilter('');
    setProjectFilter('');
    setVisitFilter('');
    setSortField('');
    setSortDirection('asc');
  };

  // Toggle row details
  const toggleExpandRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort data based on search criteria and filters
  const filteredData = useMemo(() => {
    let filtered = [...dataRows];

    // Apply text search filters
    if (propertySearch) {
      filtered = filtered.filter(row => {
        const propertyVal = row[allIdx.propertyNumber]?.toLowerCase() || '';
        const nameVal = row[allIdx.name]?.toLowerCase() || '';
        const searchTerm = propertySearch.toLowerCase();
        return propertyVal.includes(searchTerm) || nameVal.includes(searchTerm);
      });
    }

    if (phoneSearch) {
      filtered = filtered.filter(row => {
        const phoneVal = row[allIdx.number]?.toLowerCase() || '';
        return phoneVal.includes(phoneSearch.toLowerCase());
      });
    }

    // Apply dropdown filters
    if (statusFilter) {
      filtered = filtered.filter(row => {
        const status = row[allIdx.status]?.trim() || '';
        return status === statusFilter;
      });
    }

    if (telecallerFilter) {
      filtered = filtered.filter(row => {
        const telecaller = row[allIdx.telecaller]?.trim() || '';
        return telecaller === telecallerFilter;
      });
    }

    if (channelFilter) {
      filtered = filtered.filter(row => {
        const channel = row[allIdx.channel]?.trim() || '';
        return channel === channelFilter;
      });
    }

    if (propertyNeedsFilter) {
      filtered = filtered.filter(row => {
        const propertyNeed = row[allIdx.propertyNeed]?.trim() || '';
        return propertyNeed === propertyNeedsFilter;
      });
    }

    if (projectFilter) {
      filtered = filtered.filter(row => {
        const project = row[allIdx.projectInterest]?.trim() || '';
        return project === projectFilter;
      });
    }

    if (visitFilter) {
      filtered = filtered.filter(row => {
        if (visitFilter === 'done') {
          return row[allIdx.visitDone]?.trim().toLowerCase() === 'done';
        } else if (visitFilter === 'pending') {
          return !row[allIdx.visitDone] || row[allIdx.visitDone].trim() === '';
        } else if (visitFilter === 'scheduled') {
          return row[allIdx.visitDate] && row[allIdx.visitDate].trim() !== '';
        }
        return true;
      });
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
          case 'name':
            aVal = a[allIdx.name]?.toLowerCase() || '';
            bVal = b[allIdx.name]?.toLowerCase() || '';
            break;
          case 'number':
            aVal = a[allIdx.number] || '';
            bVal = b[allIdx.number] || '';
            break;
          case 'status':
            aVal = a[allIdx.status]?.toLowerCase() || '';
            bVal = b[allIdx.status]?.toLowerCase() || '';
            break;
          case 'propertyNeed':
            aVal = a[allIdx.propertyNeed]?.toLowerCase() || '';
            bVal = b[allIdx.propertyNeed]?.toLowerCase() || '';
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    dataRows, 
    propertySearch, 
    phoneSearch, 
    statusFilter, 
    telecallerFilter, 
    channelFilter, 
    propertyNeedsFilter, 
    projectFilter, 
    visitFilter,
    sortField,
    sortDirection,
    allIdx
  ]);

  // Toggle details for a row
  const toggleRowDetails = useCallback(
    (index) => setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] })),
    []
  );

  // Handle phone search
  const handlePhoneSearch = useCallback(() => {
    const match = dataRows.find(
      (row) => row[allIdx.number]?.trim() === phoneSearch.trim()
    );
    if (match) {
      setFullDetails(match);
    } else {
      alert('No customer found with the entered phone number.');
      setFullDetails(null);
    }
  }, [dataRows, allIdx, phoneSearch]);

  // Filter rows based on property search
  const filteredRows = propertySearch
    ? dataRows.filter((row) =>
        row[allIdx.propertyNumber]?.trim().includes(propertySearch.trim())
      )
    : [];

  // Helper components for better code organization
  const SummarySection = () => (
    <div className="dashboard-overview">
      <div className="stat-card">
        <div className="stat-icon">📞</div>
        <div className="stat-content">
          <h3>Total Leads</h3>
          <p className="stat-value">{dataRows.length}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <h3>Hot Leads</h3>
          <p className="stat-value">{statusCounts.leadTypes?.['Hot Lead'] || 0}</p>
          <p className="stat-secondary">
            {dataRows.length ? Math.round(((statusCounts.leadTypes?.['Hot Lead'] || 0) / dataRows.length) * 100) : 0}% of Total
          </p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <h3>Scheduled Visits</h3>
          <p className="stat-value">{plannedVisitCount}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>Completed Visits</h3>
          <p className="stat-value">{visitDoneCombined}</p>
          <p className="stat-secondary">
            {plannedVisitCount ? Math.round((visitDoneCombined / plannedVisitCount) * 100) : 0}% Completion Rate
          </p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">↗️</div>
        <div className="stat-content">
          <h3>Transferred Leads</h3>
          <p className="stat-value">{
            (statusCounts.leadTypes?.['Transferred to Sales Coordinator'] || 0) + 
            (statusCounts.leadTypes?.['Transferred to Salesman'] || 0)
          }</p>
          <p className="stat-secondary">
            Ready for next steps
          </p>
        </div>
      </div>
    </div>
  );

  const ChartsSection = () => (
    <div className="dashboard-charts">
      <div className="chart-container">
        <canvas id="visitDoneTotalChart"></canvas>
      </div>
      <div className="chart-container">
        <canvas id="visitDoneScheduledChart"></canvas>
      </div>
      <div className="chart-container">
        <canvas id="leadTypesChart"></canvas>
      </div>
    </div>
  );

  const SearchSection = () => (
    <div className="search-panel">
      <div className="search-header">
        <h2>Customer Search</h2>
        <div className="filter-toggle">
          <label className="switch">
            <input type="checkbox" onChange={(e) => setShowAdvancedFilters(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span>Advanced Filters</span>
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-field">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search by property number or name..."
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
            className="search-input"
          />
          {propertySearch && (
            <button 
              className="clear-search" 
              onClick={() => setPropertySearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="search-field">
          <div className="search-icon">📱</div>
          <input
            type="text"
            placeholder="Search by phone number..."
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            className="search-input"
          />
          {phoneSearch && (
            <button 
              className="clear-search" 
              onClick={() => setPhoneSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {Object.keys(statusCounts).map(status => 
                  status !== 'leadTypes' && (
                    <option key={status} value={status}>{status}</option>
                  )
                )}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Telecaller</label>
              <select 
                value={telecallerFilter} 
                onChange={(e) => setTelecallerFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Telecallers</option>
                {Object.keys(telecallerCounts).map(telecaller => (
                  <option key={telecaller} value={telecaller}>{telecaller}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Source</label>
              <select 
                value={channelFilter} 
                onChange={(e) => setChannelFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Sources</option>
                {Object.keys(channelCounts).map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Property Need</label>
              <select 
                value={propertyNeedsFilter} 
                onChange={(e) => setPropertyNeedsFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Property Types</option>
                {Object.keys(propertyNeedsCounts).map(need => (
                  <option key={need} value={need}>{need}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Project Interest</label>
              <select 
                value={projectFilter} 
                onChange={(e) => setProjectFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Projects</option>
                {Object.keys(projectInterestsCounts).map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Visit Status</label>
              <select 
                value={visitFilter} 
                onChange={(e) => setVisitFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All</option>
                <option value="done">Visit Done</option>
                <option value="pending">Visit Pending</option>
                <option value="scheduled">Visit Scheduled</option>
              </select>
            </div>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset All Filters
          </button>
        </div>
      )}
      
      <div className="search-results">
        <h3>
          Search Results {filteredData.length > 0 && <span>({filteredData.length} found)</span>}
        </h3>
        
        {/* Results Table */}
        {filteredData.length > 0 ? (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('number')}>
                    Phone {sortField === 'number' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('propertyNeed')}>
                    Property {sortField === 'propertyNeed' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <React.Fragment key={index}>
                    <tr className={expandedRows[index] ? 'expanded' : ''}>
                      <td>{row[allIdx.name] || 'N/A'}</td>
                      <td>{row[allIdx.number] || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${row[allIdx.status]?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                          {row[allIdx.status] || 'Unknown'}
                        </span>
                      </td>
                      <td>{row[allIdx.propertyNeed] || 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-details-btn"
                            onClick={() => toggleExpandRow(index)}
                          >
                            {expandedRows[index] ? 'Hide' : 'View'}
                          </button>
                          <button
                            className="schedule-visit-btn"
                            onClick={() => handleScheduleVisit(row)}
                            title="Schedule a visit for this lead"
                          >
                            📅 Schedule
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[index] && (
                      <tr className="details-row">
                        <td colSpan={5}>
                          <div className="customer-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{row[allIdx.email] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">City:</span>
                                <span className="detail-value">{row[allIdx.city] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Occupation:</span>
                                <span className="detail-value">{row[allIdx.occupation] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Channel:</span>
                                <span className="detail-value">{row[allIdx.channel] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Telecaller:</span>
                                <span className="detail-value">{row[allIdx.telecaller] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Project Interest:</span>
                                <span className="detail-value">{row[allIdx.projectInterest] || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Visit Date:</span>
                                <span className="detail-value">{row[allIdx.visitDate] || 'Not Scheduled'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Visit Status:</span>
                                <span className="detail-value">{row[allIdx.visitDone] || 'Pending'}</span>
                              </div>
                            </div>
                            <div className="detail-item full-width">
                              <span className="detail-label">Feedback:</span>
                              <span className="detail-value">{row[allIdx.comment] || 'No feedback yet'}</span>
                            </div>
                            <div className="details-actions">
                              <button
                                className="full-details-btn"
                                onClick={() => setFullDetails(row)}
                              >
                                View Full Details
                              </button>
                              <button
                                className="schedule-visit-btn primary"
                                onClick={() => handleScheduleVisit(row)}
                              >
                                Schedule Visit
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>No customers found matching your search criteria</p>
            {(propertySearch || phoneSearch || statusFilter || telecallerFilter || 
              channelFilter || propertyNeedsFilter || projectFilter || visitFilter) && (
              <button 
                className="reset-search-btn"
                onClick={resetFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Visit Scheduler Modal */}
      {showVisitScheduler && selectedLeadForVisit && (
        <VisitScheduler 
          selectedLead={selectedLeadForVisit}
          onClose={() => {
            setShowVisitScheduler(false);
            setSelectedLeadForVisit(null);
          }}
          onSchedule={handleVisitScheduled}
        />
      )}
    </div>
  );

  const CustomerDetails = () => (
    <>
      {propertySearch && filteredRows.length > 0 && (
        <section className="customer-details">
          <h2>Customer Details</h2>
          <table id="customerTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>Email</th>
                <th>City</th>
                <th>Telecaller</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <React.Fragment key={i}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => toggleRowDetails(i)}
                      >
                        {row[allIdx.name]}
                      </button>
                    </td>
                    <td>{row[allIdx.number]}</td>
                    <td>{row[allIdx.email]}</td>
                    <td>{row[allIdx.city]}</td>
                    <td>{row[allIdx.telecaller]}</td>
                    <td>{row[allIdx.status]}</td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => toggleRowDetails(i)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  {expandedRows[i] && (
                    <tr className="details">
                      <td colSpan="7">
                        <strong>Full Details:</strong>
                        <br />
                        DATE/TIME: {row[allIdx.dateTime]}
                        <br />
                        NAME: {row[allIdx.name]}
                        <br />
                        NUMBER: {row[allIdx.number]}
                        <br />
                        EMAIL: {row[allIdx.email]}
                        <br />
                        CITY: {row[allIdx.city]}
                        <br />
                        OCCUPATION: {row[allIdx.occupation]}
                        <br />
                        Dealer/Investor/Enduser: {row[allIdx.dealerInvestorEnduser]}
                        <br />
                        Channel: {row[allIdx.channel]}
                        <br />
                        PLANNING FOR VISIT: {row[allIdx.planningVisit]}
                        <br />
                        Comment/feedback: {row[allIdx.comment]}
                        <br />
                        STATUS: {row[allIdx.status]}
                        <br />
                        PROJECT MAP/ PAYMENT PLAN SENT ?: {row[allIdx.projectMap]}
                        <br />
                        PHOTO/ VIDEO: {row[allIdx.photoVideo]}
                        <br />
                        Visit Date: {row[allIdx.visitDate]}
                        <br />
                        Visit done: {row[allIdx.visitDone]}
                        <br />
                        POST-VISIT FEEDBACK: {row[allIdx.postVisitFeedback]}
                        <br />
                        NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi: {row[allIdx.propertyNeed]}
                        <br />
                        Virat Greens/ Virat Crown/ Both Projects: {row[allIdx.projectInterest]}
                        <br />
                        Plot Size Requirement: {row[allIdx.plotSize]}
                        <br />
                        PROPERTY NUMBER: {row[allIdx.propertyNumber]}
                        <br />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {fullDetails && (
        <section className="customer-full-details">
          <h2>Customer Full Details</h2>
          <p>
            <strong>DATE/TIME:</strong> {fullDetails[allIdx.dateTime]}
          </p>
          <p>
            <strong>NAME:</strong> {fullDetails[allIdx.name]}
          </p>
          <p>
            <strong>NUMBER:</strong> {fullDetails[allIdx.number]}
          </p>
          <p>
            <strong>EMAIL:</strong> {fullDetails[allIdx.email]}
          </p>
          <p>
            <strong>CITY:</strong> {fullDetails[allIdx.city]}
          </p>
          <p>
            <strong>OCCUPATION:</strong> {fullDetails[allIdx.occupation]}
          </p>
          <p>
            <strong>Dealer/Investor/Enduser:</strong> {fullDetails[allIdx.dealerInvestorEnduser]}
          </p>
          <p>
            <strong>Channel:</strong> {fullDetails[allIdx.channel]}
          </p>
          <p>
            <strong>PLANNING FOR VISIT:</strong> {fullDetails[allIdx.planningVisit]}
          </p>
          <p>
            <strong>Comment/feedback:</strong> {fullDetails[allIdx.comment]}
          </p>
          <p>
            <strong>STATUS:</strong> {fullDetails[allIdx.status]}
          </p>
          <p>
            <strong>PROJECT MAP/ PAYMENT PLAN SENT ?:</strong> {fullDetails[allIdx.projectMap]}
          </p>
          <p>
            <strong>PHOTO/ VIDEO:</strong> {fullDetails[allIdx.photoVideo]}
          </p>
          <p>
            <strong>Visit Date:</strong> {fullDetails[allIdx.visitDate]}
          </p>
          <p>
            <strong>Visit done:</strong> {fullDetails[allIdx.visitDone]}
          </p>
          <p>
            <strong>POST-VISIT FEEDBACK:</strong> {fullDetails[allIdx.postVisitFeedback]}
          </p>
          <p>
            <strong>NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi:</strong> {fullDetails[allIdx.propertyNeed]}
          </p>
          <p>
            <strong>Virat Greens/ Virat Crown/ Both Projects:</strong> {fullDetails[allIdx.projectInterest]}
          </p>
          <p>
            <strong>Plot Size Requirement:</strong> {fullDetails[allIdx.plotSize]}
          </p>
          <p>
            <strong>PROPERTY NUMBER:</strong> {fullDetails[allIdx.propertyNumber]}
          </p>
        </section>
      )}
    </>
  );

  // Component for scheduling visits
  const VisitScheduler = ({ selectedLead, onClose, onSchedule }) => {
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Here you would normally make an API call to save the visit
      // For demo purposes, we'll simulate a successful save
      setTimeout(() => {
        onSchedule({
          lead: selectedLead,
          visitDate,
          visitTime,
          notes
        });
        setIsSubmitting(false);
        onClose();
      }, 800);
    };
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Schedule Visit</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="lead-info">
            <p><strong>Name:</strong> {selectedLead[allIdx.name] || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedLead[allIdx.number] || 'N/A'}</p>
            <p><strong>Property Interest:</strong> {selectedLead[allIdx.propertyNeed] || 'N/A'}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="visitDate">Visit Date</label>
              <input 
                type="date" 
                id="visitDate" 
                value={visitDate} 
                onChange={(e) => setVisitDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="visitTime">Visit Time</label>
              <input 
                type="time" 
                id="visitTime" 
                value={visitTime} 
                onChange={(e) => setVisitTime(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or details about the visit..."
                rows={3}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add state to manage the visit scheduler modal
  const [showVisitScheduler, setShowVisitScheduler] = useState(false);
  const [selectedLeadForVisit, setSelectedLeadForVisit] = useState(null);
  
  // Function to handle scheduling a visit
  const handleScheduleVisit = (lead) => {
    setSelectedLeadForVisit(lead);
    setShowVisitScheduler(true);
  };
  
  // Function to handle the actual visit scheduling
  const handleVisitScheduled = (visitData) => {
    // Here you would update your data source or make an API call
    // For demo purposes, we'll just log the data
    console.log('Visit scheduled:', visitData);
    
    // Show confirmation message
    alert(`Visit scheduled for ${visitData.lead[allIdx.name]} on ${visitData.visitDate} at ${visitData.visitTime}`);
    
    // Close the modal
    setShowVisitScheduler(false);
    setSelectedLeadForVisit(null);
  };

  return (
    <div className="dashboard-container">
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading data...</p>
        </div>
      )}

      {errorMsg && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{errorMsg}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {!loading && !errorMsg && (
        <>
          <h1 className="dashboard-title">Telecaller Dashboard</h1>
          <p className="dashboard-subtitle">Manage leads, filter data, and schedule visits</p>

          <div className="dashboard-section">
            <h2 className="section-title">Overview</h2>
            <SummarySection />
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Performance Metrics</h2>
            <ChartsSection />
          </div>
          
          <div className="dashboard-section">
            <h2 className="section-title">Call Center Activity</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Telecaller Performance</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Telecaller</th>
                      <th>Leads</th>
                      <th>Conversion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(telecallerCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([name, count]) => {
                        // Calculate conversion rate (transferred leads)
                        const convertedLeadsCount = dataRows.filter(
                          row => 
                            row[allIdx.telecaller]?.trim() === name && 
                            (row[allIdx.status]?.trim() === 'Transferred to Sales Coordinator' || 
                             row[allIdx.status]?.trim() === 'Transferred to Salesman' ||
                             row[allIdx.status]?.trim() === 'Hot Lead')
                        ).length;
                        const conversionRate = count > 0 ? Math.round((convertedLeadsCount / count) * 100) : 0;
                        
                        return (
                          <tr key={name}>
                            <td>{name}</td>
                            <td>{count}</td>
                            <td>{conversionRate}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              <div className="dashboard-card">
                <h3>Lead Sources</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Leads</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(channelCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([channel, count]) => (
                        <tr key={channel}>
                          <td>{channel}</td>
                          <td>{count}</td>
                          <td>{dataRows.length > 0 ? Math.round((count / dataRows.length) * 100) : 0}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Lead Management</h2>
            <div className="role-actions">
              <div className="role-info">
                <h3>Telecaller Role</h3>
                <p>As a Telecaller, your primary responsibilities are:</p>
                <ul>
                  <li>Handle fresh leads from all sources</li>
                  <li>Qualify and filter leads by interest level</li>
                  <li>Schedule property visits for interested clients</li>
                  <li>Transfer qualified leads to Sales Coordinator or Salesman</li>
                </ul>
              </div>
              <div className="action-cards">
                <div className="action-card">
                  <div className="action-icon">📞</div>
                  <h4>New Leads</h4>
                  <p>{dataRows.filter(row => !row[allIdx.status] || row[allIdx.status].trim() === '').length} new leads need qualification</p>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setStatusFilter('');
                      setShowAdvancedFilters(true);
                      // Scroll to search section
                      document.querySelector('.search-panel').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View New Leads
                  </button>
                </div>
                <div className="action-card">
                  <div className="action-icon">🗓️</div>
                  <h4>Schedule Visits</h4>
                  <p>Convert qualified leads into property visits</p>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setStatusFilter('Hot Lead');
                      setShowAdvancedFilters(true);
                      // Scroll to search section
                      document.querySelector('.search-panel').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View Hot Leads
                  </button>
                </div>
              </div>
            </div>
            <SearchSection />
          </div>
          
          {showVisitScheduler && selectedLeadForVisit && (
            <VisitScheduler 
              selectedLead={selectedLeadForVisit}
              onClose={() => {
                setShowVisitScheduler(false);
                setSelectedLeadForVisit(null);
              }}
              onSchedule={handleVisitScheduled}
            />
          )}
          
          {fullDetails && (
            <div className="modal-overlay">
              <div className="modal-content customer-full-details">
                <div className="modal-header">
                  <h2>Customer Details</h2>
                  <button className="close-btn" onClick={() => setFullDetails(null)}>×</button>
                </div>
                <div className="customer-details-content">
                  <div className="details-grid">
                    {Object.entries(allIdx).map(([key, index]) => 
                      index >= 0 && fullDetails[index] && (
                        <div className="detail-item" key={key}>
                          <span className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="detail-value">{fullDetails[index]}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="details-actions">
                    <button
                      className="schedule-visit-btn primary"
                      onClick={() => {
                        handleScheduleVisit(fullDetails);
                        setFullDetails(null);
                      }}
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TelecallerDashboard;
