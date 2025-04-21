import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import '../styles/telecallerDashboard.css';
import { FaPlay, FaPause, FaDownload, FaVolumeUp, FaVolumeMute, FaSearch, FaPhone, FaPhoneSlash, FaMicrophone, FaFilter, FaCalendarAlt, FaUser, FaUserTie } from 'react-icons/fa';

// Add CSS for loading spinner
const loadingSpinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  
  .play-pause-btn.loading {
    opacity: 0.7;
    cursor: wait;
  }
  
  .audio-error {
    padding: 10px;
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    color: #856404;
    margin-bottom: 10px;
  }
  
  .error-message {
    display: flex;
    align-items: center;
  }
  
  .error-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .open-drive-btn {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 8px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .open-drive-btn:hover {
    background-color: #0069d9;
  }
`;

// Constants for the Google Drive integration
const TELECALLER_DATA = {
  simran: {
    name: "Simran",
    phoneNumber: "8556896739",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmt55C-IwM1wBt0Yr6WaOuaEK9GqrsZfzTXJnv0X8iA2PSOx6-YIAMZ4RHGkQ0ofozQB_jk3ezvfsg/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1gHXfzx_WzfbKqncHiXDnLiojYw8tVqrN?usp=drive_link",
    role: "telecaller"
  },
  raman: {
    name: "Raman",
    phoneNumber: "9876543210", 
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcQdwDgi53G6fKGYYspy5H6ixwiL0ofXdfvfODaUvkg-QfisHMAOgnrsxzIcvJjSM60iu7pvH3iO44/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1yYOvaPvquMfeemHCf5iDz4QDUXQNpKwf?usp=sharing",
    role: "telecaller"
  },
  rupali: {
    name: "Rupali",
    phoneNumber: "9876543211", 
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjPznndiMvibis4pMsKUWDOJz80y_BRtlADpJTSR6ZFa33wl1rLoFgvtVLt-ZvceUmyJAMVpkW_yJM/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1GWJnN6zqQ3k7TsDPOPXyLWhyLnkO0h-9?usp=drive_link",
    role: "telecaller"
  },
  // Sales Coordinators
  gagan: {
    name: "Gagan",
    phoneNumber: "9876543212",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRaiohGFPfF4tYhjDRqgRLbnhaXdWdt27bbAIArm3zm98ItVMVElkTj6xqcuCWfB1CqnyuR5DQA_MwG/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/12-V9csAjHl9597ywBNGXDl-0fN6uNlgr?usp=sharing",
    role: "salesCoordinator"
  },
  aman: {
    name: "Aman",
    phoneNumber: "9876543213",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRxxlCwcIVmvzhmCfoCjrbPmApoPP_MCPCo3J-nRvbPHtbAXI8Jf_NkCWYgd-fIP8gs4ZaFp0cK8cv0/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/14T-_xLaEcb5ww6wHV53Mds8QZ0aJpPv7?usp=sharing",
    role: "salesCoordinator"
  },
  arsh: {
    name: "Arsh",
    phoneNumber: "9876543214",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjwHOTpRN3iOmwidF7J8jm8I9mJYxdfDo5YIT8fYHfaJTpMrTpVfK1h6T5sfou1cZzD2NluZqVGvW3/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1oDFEG37FVPuli0pBYSVPZDLigMyn5Qba?usp=sharing",
    role: "salesCoordinator"
  },
  // Salesmen
  arun: {
    name: "Arun",
    phoneNumber: "9876543215",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJPcfkQFPrBLoLg8LJs6kRFl8wDlDimEZgGs0xz-ZkHF8w5__XK5NFx1LgHkOGkASvXXn5FVzWczY3/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1Kv7zzqbitm5gFXwZwPl8aSac1tzNTV4q?usp=sharing",
    role: "salesman"
  },
  jaskaran: {
    name: "Jaskaran",
    phoneNumber: "9876543216",
    callLogSheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRzCqhQnHsZbGVZpgEYvfl5sBk5ssLCYPaKTA3ttj21JaSA0vjoYKX2UfrKgHQXSjX6yr3cT6XRi45/pub?output=csv",
    recordingsFolder: "https://drive.google.com/drive/folders/1gigGq0px0SxgVpu2C17YaNp29sTUaHs-?usp=sharing",
    role: "salesman"
  },
  // CRM
  daljeet: {
    name: "Daljeet",
    phoneNumber: "9876543217",
    callLogSheet: "https://docs.google.com/spreadsheets/d/daljeet-call-logs-sheet-id/edit",
    recordingsFolder: "https://drive.google.com/drive/folders/daljeet-recordings-folder-id",
    role: "crm"
  }
};

const CallAnalyticsDashboard = () => {
  // Create a style element for custom CSS
  useEffect(() => {
    // Add the custom styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = loadingSpinnerStyles;
    document.head.appendChild(styleElement);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // States for call data
  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recordingSearchQuery, setRecordingSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('callLogs'); // 'callLogs' or 'recordings'
  const [roleFilter, setRoleFilter] = useState(''); // 'telecaller', 'salesCoordinator', 'salesman', 'crm'
  
  // States for metrics
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    missedCalls: 0,
    didNotConnectCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
    telecallerPerformance: {}
  });

  // References for charts
  const callTypeChartRef = useRef(null);
  const callDurationChartRef = useRef(null);
  const telecallerPerformanceChartRef = useRef(null);
  const dailyCallsChartRef = useRef(null);
  
  const callTypeChart = useRef(null);
  const callDurationChart = useRef(null);
  const telecallerPerformanceChart = useRef(null);
  const dailyCallsChart = useRef(null);

  // Function to fetch call data from the call log sheet
  const fetchCallData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Create an array to store all call data
      let allCallData = [];
      let hasFetchedAnyData = false;
      
      // Fetch data from each API endpoint based on TELECALLER_DATA
      const fetchPromises = Object.values(TELECALLER_DATA).map(async (staff) => {
        try {
          console.log(`Fetching data for ${staff.name} from ${staff.callLogSheet}`);
          
          // Using fetch API to get CSV data from Google Sheets
          const response = await fetch(staff.callLogSheet, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            console.error(`Failed to fetch data for ${staff.name}: ${response.status} ${response.statusText}`);
            return [];
          }
          
          const csvText = await response.text();
          
          // If the CSV is empty or doesn't contain data, log and return empty array
          if (!csvText || csvText.trim().length === 0) {
            console.error(`Empty CSV data for ${staff.name}`);
            return [];
          }
          
          const rows = csvText.trim().split('\n').map(row => {
            // Handle both comma-separated and tab-separated data
            if (row.includes(',')) {
              return row.split(',');
            } else if (row.includes('\t')) {
              return row.split('\t');
            }
            return row.split(','); // Default to comma
          });
          
          // Find the header row
          const headerIndex = rows.findIndex(row => 
            row.some(cell => cell && (
              cell.includes('Date') || 
              cell.includes('Sr.No') || 
              cell.includes('From Number')
            ))
          );
          
          if (headerIndex === -1) {
            console.error(`Could not find header row in data for ${staff.name}`);
            return [];
          }
          
          const headers = rows[headerIndex].map(h => h ? h.trim() : '');
          const data = rows.slice(headerIndex + 1);
          
          // Log the headers and first row to understand structure
          console.log(`Headers for ${staff.name}:`, headers);
          if (data.length > 0) {
            console.log(`First row for ${staff.name}:`, data[0]);
          }
          
          // Map column indexes to our standardized schema
          const columnMap = {
            date: headers.findIndex(h => h.includes('Date') && !h.includes('Date Time')),
            time: headers.findIndex(h => h.includes('Time')),
            dateTime: headers.findIndex(h => h.includes('Date Time')),
            fromNumber: headers.findIndex(h => h.includes('From Number') || h.includes('From') || h.includes('Source')),
            toNumber: headers.findIndex(h => h.includes('To Number') || h.includes('To') || h.includes('Destination')),
            duration: headers.findIndex(h => h.includes('Duration')),
            type: headers.findIndex(h => h.includes('Type') || h.includes('Call Type')),
            name: headers.findIndex(h => h.includes('Name') || h.includes('Customer') || h.includes('Contact')),
          };
          
          // Process each row of data
          const processedData = data.map((row, index) => {
            // Skip rows with insufficient data
            if (!row || row.length < 3) {
              return null;
            }
            
            // Extract relevant fields using column mapping
            let callDate = columnMap.date !== -1 && row[columnMap.date] ? row[columnMap.date].trim() : '';
            const callTime = columnMap.time !== -1 && row[columnMap.time] ? row[columnMap.time].trim() : '';
            const dateTime = columnMap.dateTime !== -1 && row[columnMap.dateTime] ? row[columnMap.dateTime].trim() : '';
            const fromNumber = columnMap.fromNumber !== -1 && row[columnMap.fromNumber] ? row[columnMap.fromNumber].trim() : '';
            const toNumber = columnMap.toNumber !== -1 && row[columnMap.toNumber] ? row[columnMap.toNumber].trim() : '';
            const duration = columnMap.duration !== -1 && row[columnMap.duration] ? row[columnMap.duration].trim() : '00h 00m 00s';
            let callType = columnMap.type !== -1 && row[columnMap.type] ? row[columnMap.type].trim() : '';
            const customerName = columnMap.name !== -1 && row[columnMap.name] ? row[columnMap.name].trim() : `Customer ${index + 1}`;
            
            // If date is missing but we have dateTime, extract date from it
            if ((!callDate || callDate === '') && dateTime) {
              callDate = dateTime.split(' ')[0];
            }
            
            // If we still don't have a date, skip this record
            if (!callDate || callDate === '') {
              return null;
            }
            
            // Determine call type if not explicitly provided
            if (!callType) {
              if (toNumber === staff.phoneNumber) {
                callType = 'Incoming';
              } else if (fromNumber === staff.phoneNumber) {
                callType = 'Outgoing';
              }
            }
            
            // Normalize call type
            if (callType.toLowerCase().includes('incoming')) {
              callType = 'Incoming';
            } else if (callType.toLowerCase().includes('outgoing')) {
              callType = 'Outgoing';
            } else if (callType.toLowerCase().includes('missed')) {
              callType = 'Missed';
            } else if (duration === '00h 00m 00s' || duration === '0:00' || duration === '00:00:00') {
              callType = 'Did Not Connect';
            }
            
            // Parse duration to seconds for easier calculations
            const durationSeconds = parseDuration(duration);
            
            // Format date consistently (YYYY-MM-DD)
            let formattedDate = callDate;
            if (callDate.includes('/')) {
              const parts = callDate.split('/');
              if (parts.length === 3) {
                // Handle MM/DD/YYYY format
                const month = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
                formattedDate = `${year}-${month}-${day}`;
              }
            }
            
            // Generate a recording filename based on date and time
            // Format: call_YYYYMMDD_HHMMSS.mp3
            const dateFormatted = formattedDate.replace(/-/g, '');
            let timeFormatted = callTime.replace(/:/g, '');
            if (timeFormatted.length === 0 && dateTime) {
              const timePart = dateTime.split(' ')[1];
              if (timePart) {
                timeFormatted = timePart.replace(/:/g, '');
              }
            }
            
            // Generate various recording filename formats to increase chance of matching
            const recordingFilenames = [
              `call_${dateFormatted}_${timeFormatted}.mp3`,
              `${fromNumber}_${toNumber}_${dateFormatted}_${timeFormatted}.mp3`,
              `${staff.name.toLowerCase()}_${customerName.toLowerCase().replace(/\s+/g, '_')}_${dateFormatted}.mp3`,
              `${dateFormatted}_${timeFormatted}.mp3`
            ];
            
            // Use Google Drive API compatible URL for recordings
            const recordingUrls = recordingFilenames.map(filename => {
              return `${generateDriveEmbedUrl(staff.recordingsFolder, filename)}`;
            });
            
            // Return the processed call data
            return {
              id: `${staff.name}_${index}`,
              srNo: index + 1,
              name: customerName,
              fromNumber,
              toNumber,
              date: formattedDate,
              time: callTime || (dateTime ? dateTime.split(' ')[1] : ''),
              dateTime: dateTime || `${formattedDate} ${callTime}`,
              duration,
              durationSeconds,
              callType,
              telecaller: staff.name,
              role: staff.role,
              customerName,
              status: determineCallStatus(callType),
              notes: `Call with ${customerName}`,
              recordingFilenames,
              recordingUrls,
              primaryRecordingUrl: recordingUrls[0]
            };
          }).filter(Boolean); // Remove null entries
          
          if (processedData.length > 0) {
            hasFetchedAnyData = true;
            console.log(`Successfully processed ${processedData.length} records for ${staff.name}`);
          } else {
            console.warn(`No valid data processed for ${staff.name}`);
          }
          
          return processedData;
        } catch (error) {
          console.error(`Error processing data for ${staff.name}:`, error);
          return [];
        }
      });
      
      // Wait for all promises to resolve
      const results = await Promise.allSettled(fetchPromises);
      
      // Collect successful results
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allCallData = [...allCallData, ...result.value];
        }
      });
      
      // If we couldn't get any data, try the fallback with sample data
      if (allCallData.length === 0 || !hasFetchedAnyData) {
        console.warn('Unable to fetch real data, using sample data instead');
        allCallData = generateSampleCallData();
      }
      
      // Sort by date and time (newest first)
      allCallData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
        return dateB - dateA;
      });
      
      console.log(`Total call data records: ${allCallData.length}`);
      setCallData(allCallData);
      calculateMetrics(allCallData);
    } catch (err) {
      console.error("Error fetching call data:", err);
      setError('Failed to load call data. Please try again later.');
      
      // Fallback to sample data in case of error
      const sampleData = generateSampleCallData();
      setCallData(sampleData);
      calculateMetrics(sampleData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to generate Google Drive embed URLs
  const generateDriveEmbedUrl = (folderUrl, filename) => {
    // Extract folder ID from Google Drive folder URL
    const folderIdMatch = folderUrl.match(/[-\w]{25,}/);
    const folderId = folderIdMatch ? folderIdMatch[0] : '';
    
    if (!folderId) {
      return '';
    }
    
    // For recordings, we can't directly access files by name from a folder ID
    // So we'll create a search link that opens the folder with a filename filter
    return `https://drive.google.com/drive/folders/${folderId}?q=${encodeURIComponent(filename)}`;
  };

  // Generate sample data including role information
  const generateSampleCallData = () => {
    const sampleData = [];
    const staffMembers = Object.values(TELECALLER_DATA);
    
    // Create 100 sample calls distributed among all staff
    for (let i = 0; i < 200; i++) {
      const staffMember = staffMembers[Math.floor(Math.random() * staffMembers.length)];
      
      // Generate a random date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate a random time
      const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      // Determine if this is an incoming or outgoing call
      const isOutgoing = Math.random() > 0.5;
      
      // For calls that are missed or did not connect
      const isMissed = Math.random() > 0.8;
      const didNotConnect = !isMissed && Math.random() > 0.8 && isOutgoing;
      
      // Generate duration based on call type
      let durationStr = '00h 00m 00s';
      let durationSeconds = 0;
      
      if (!isMissed && !didNotConnect) {
        const durationMinutes = Math.floor(Math.random() * 15);
        const durationSecs = Math.floor(Math.random() * 60);
        durationStr = `00h ${durationMinutes.toString().padStart(2, '0')}m ${durationSecs.toString().padStart(2, '0')}s`;
        durationSeconds = durationMinutes * 60 + durationSecs;
      }
      
      // Determine call type based on the specifications
      let callType;
      if (isMissed) {
        callType = 'Missed';
      } else if (didNotConnect) {
        callType = 'Did Not Connect';
      } else if (isOutgoing) {
        callType = 'Outgoing';
      } else {
        callType = 'Incoming';
      }
      
      // Generate a customer name and phone number
      const customerName = `Customer ${i + 1}`;
      const customerNumber = `91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      
      // Set fromNumber and toNumber based on call direction
      const fromNumber = isOutgoing ? staffMember.phoneNumber : customerNumber;
      const toNumber = isOutgoing ? customerNumber : staffMember.phoneNumber;
      
      // Generate a recording URL for completed calls
      const recordingUrl = (!isMissed && !didNotConnect) ? 
        `${staffMember.recordingsFolder}/call_${dateStr.replace(/-/g, '')}_${timeStr.replace(':', '')}.mp3` : 
        '';
      
      // Add the call to our sample data
      sampleData.push({
        id: i + 1,
        srNo: i + 1,
        name: customerName,
        fromNumber,
        toNumber,
        date: dateStr,
        time: timeStr,
        dateTime: `${dateStr} ${timeStr}`,
        duration: durationStr,
        durationSeconds: durationSeconds,
        callType,
        telecaller: staffMember.name,
        role: staffMember.role,
        customerName,
        status: determineCallStatus(callType),
        notes: `Call notes for ${customerName}`,
        recordingUrl
      });
    }
    
    return sampleData;
  };

  // Helper function to determine call status
  const determineCallStatus = (callType) => {
    if (callType === 'Missed' || callType === 'Did Not Connect') {
      return 'Not Reached';
    }
    
    const statuses = ['Completed', 'Follow-up Required', 'Interested', 'Not Interested'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Format duration string from "00h 00m 00s" format to seconds
  const parseDuration = (durationStr) => {
    if (!durationStr || durationStr === '00h 00m 00s') return 0;
    
    const regex = /(\d+)h\s+(\d+)m\s+(\d+)s/;
    const match = durationStr.match(regex);
    
    if (!match) return 0;
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Calculate metrics from call data
  const calculateMetrics = (data) => {
    const filteredData = data.filter(call => {
      const callDate = new Date(call.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setDate(endDate.getDate() + 1); // Include the end date
      return callDate >= startDate && callDate < endDate;
    });

    // Based on the requirements:
    // Incoming Calls: Based on "to number" matching the telecaller number
    // Outgoing Calls: Based on "from number" matching the telecaller number
    // Missed Calls: Calls where the duration is missing or null
    // Did Not Connect Calls: Outgoing calls with a duration of 00:00:00
    const incomingCalls = filteredData.filter(call => call.callType === 'Incoming');
    const outgoingCalls = filteredData.filter(call => call.callType === 'Outgoing');
    const missedCalls = filteredData.filter(call => call.callType === 'Missed');
    const didNotConnectCalls = filteredData.filter(call => call.callType === 'Did Not Connect');
    
    const completedCalls = [...incomingCalls, ...outgoingCalls];
    const totalDuration = completedCalls.reduce((total, call) => total + call.durationSeconds, 0);
    
    // Calculate telecaller performance
    const telecallerPerformance = {};
    
    // Initialize telecaller performance objects for all known telecallers
    Object.values(TELECALLER_DATA).forEach(telecaller => {
      telecallerPerformance[telecaller.name] = {
        totalCalls: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        missedCalls: 0,
        didNotConnectCalls: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    });
    
    // Calculate metrics for each call
    filteredData.forEach(call => {
      if (!telecallerPerformance[call.telecaller]) {
        telecallerPerformance[call.telecaller] = {
          totalCalls: 0,
          incomingCalls: 0,
          outgoingCalls: 0,
          missedCalls: 0,
          didNotConnectCalls: 0,
          totalDuration: 0,
          avgDuration: 0
        };
      }
      
      telecallerPerformance[call.telecaller].totalCalls++;
      
      if (call.callType === 'Incoming') {
        telecallerPerformance[call.telecaller].incomingCalls++;
        telecallerPerformance[call.telecaller].totalDuration += call.durationSeconds;
      } else if (call.callType === 'Outgoing') {
        telecallerPerformance[call.telecaller].outgoingCalls++;
        telecallerPerformance[call.telecaller].totalDuration += call.durationSeconds;
      } else if (call.callType === 'Missed') {
        telecallerPerformance[call.telecaller].missedCalls++;
      } else if (call.callType === 'Did Not Connect') {
        telecallerPerformance[call.telecaller].didNotConnectCalls++;
      }
    });
    
    // Calculate average durations for each telecaller
    Object.keys(telecallerPerformance).forEach(telecaller => {
      const completedCallsCount = 
        telecallerPerformance[telecaller].incomingCalls + 
        telecallerPerformance[telecaller].outgoingCalls;
      
      telecallerPerformance[telecaller].avgDuration = completedCallsCount > 0 
        ? telecallerPerformance[telecaller].totalDuration / completedCallsCount 
        : 0;
    });
    
    setMetrics({
      totalCalls: filteredData.length,
      incomingCalls: incomingCalls.length,
      outgoingCalls: outgoingCalls.length,
      missedCalls: missedCalls.length,
      didNotConnectCalls: didNotConnectCalls.length,
      totalDuration,
      avgDuration: completedCalls.length > 0 ? totalDuration / completedCalls.length : 0,
      telecallerPerformance
    });
  };

  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds) => {
    if (seconds === 0) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format total duration from seconds to HH:MM:SS
  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize and update charts
  useEffect(() => {
    if (callData.length === 0) return;

    // Destroy existing charts
    if (callTypeChart.current) callTypeChart.current.destroy();
    if (callDurationChart.current) callDurationChart.current.destroy();
    if (telecallerPerformanceChart.current) telecallerPerformanceChart.current.destroy();
    if (dailyCallsChart.current) dailyCallsChart.current.destroy();

    // Call Types Chart
    if (callTypeChartRef.current) {
      const ctx = callTypeChartRef.current.getContext('2d');
      callTypeChart.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Incoming', 'Outgoing', 'Missed', 'Did Not Connect'],
          datasets: [{
            data: [
              metrics.incomingCalls,
              metrics.outgoingCalls,
              metrics.missedCalls,
              metrics.didNotConnectCalls
            ],
            backgroundColor: [
              '#4CAF50', // Green for incoming
              '#2196F3', // Blue for outgoing
              '#F44336', // Red for missed
              '#FFC107'  // Amber for did not connect
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Call Distribution by Type'
            }
          }
        }
      });
    }

    // Call Duration Chart
    if (callDurationChartRef.current) {
      const ctx = callDurationChartRef.current.getContext('2d');
      callDurationChart.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['< 1 min', '1-2 min', '2-5 min', '5-10 min', '> 10 min'],
          datasets: [{
            label: 'Number of Calls',
            data: [
              callData.filter(call => call.durationSeconds > 0 && call.durationSeconds < 60).length,
              callData.filter(call => call.durationSeconds >= 60 && call.durationSeconds < 120).length,
              callData.filter(call => call.durationSeconds >= 120 && call.durationSeconds < 300).length,
              callData.filter(call => call.durationSeconds >= 300 && call.durationSeconds < 600).length,
              callData.filter(call => call.durationSeconds >= 600).length
            ],
            backgroundColor: [
              '#81C784',  // Light green
              '#64B5F6',  // Light blue
              '#FFB74D',  // Light orange
              '#E57373',  // Light red
              '#9575CD'   // Light purple
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
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
                text: 'Duration'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Call Duration Distribution'
            }
          }
        }
      });
    }

    // Telecaller Performance Chart
    if (telecallerPerformanceChartRef.current) {
      const telecallers = Object.keys(metrics.telecallerPerformance);
      const totalCallsData = telecallers.map(t => metrics.telecallerPerformance[t].totalCalls);
      
      const ctx = telecallerPerformanceChartRef.current.getContext('2d');
      telecallerPerformanceChart.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: telecallers,
          datasets: [{
            label: 'Total Calls',
            data: totalCallsData,
            backgroundColor: '#3F51B5',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
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
                text: 'Telecaller'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Telecaller Performance'
            }
          }
        }
      });
    }

    // Daily Calls Chart
    if (dailyCallsChartRef.current) {
      // Group calls by date
      const dateMap = {};
      callData.forEach(call => {
        const callDate = new Date(call.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        
        if (callDate >= startDate && callDate < endDate) {
          if (!dateMap[call.date]) {
            dateMap[call.date] = { total: 0, incoming: 0, outgoing: 0, missed: 0, didNotConnect: 0 };
          }
          
          dateMap[call.date].total++;
          
          if (call.callType === 'Incoming') {
            dateMap[call.date].incoming++;
          } else if (call.callType === 'Outgoing') {
            dateMap[call.date].outgoing++;
          } else if (call.callType === 'Missed') {
            dateMap[call.date].missed++;
          } else if (call.callType === 'Did Not Connect') {
            dateMap[call.date].didNotConnect++;
          }
        }
      });
      
      // Sort dates
      const sortedDates = Object.keys(dateMap).sort();
      
      const ctx = dailyCallsChartRef.current.getContext('2d');
      dailyCallsChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [{
            label: 'Total Calls',
            data: sortedDates.map(date => dateMap[date].total),
            borderColor: '#673AB7',
            backgroundColor: 'rgba(103, 58, 183, 0.1)',
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
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
          },
          plugins: {
            title: {
              display: true,
              text: 'Daily Call Volume'
            }
          }
        }
      });
    }
  }, [callData, metrics, dateRange]);

  // Fetch data on component mount
  useEffect(() => {
    fetchCallData();
  }, [fetchCallData]);

  // Get the unique telecallers from the call data
  const uniqueTelecallers = [...new Set(callData.map(call => call.telecaller))].sort();

  // Get filtered call logs for display
  const filteredCallLogs = callData.filter(call => {
    const isInDateRange = new Date(call.date) >= new Date(dateRange.startDate) && 
                         new Date(call.date) <= new Date(dateRange.endDate);
    
    const matchesRole = roleFilter === '' || 
      (call.role && call.role.toLowerCase() === roleFilter.toLowerCase());
    
    const matchesTelecaller = telecallerFilter === '' || call.telecaller === telecallerFilter;
    
    const matchesSearch = searchQuery === '' || 
      call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.fromNumber.includes(searchQuery) ||
      call.toNumber.includes(searchQuery) ||
      (call.notes && call.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return isInDateRange && matchesRole && matchesTelecaller && matchesSearch;
  });

  // Filter recordings based on the search query and ensure they have recordings
  const filteredRecordings = callData.filter(call => {
    // Make sure we have a recording URL
    if (!call.primaryRecordingUrl) return false;
    
    const isInDateRange = new Date(call.date) >= new Date(dateRange.startDate) && 
                          new Date(call.date) <= new Date(dateRange.endDate);
    const matchesTelecaller = telecallerFilter === '' || call.telecaller === telecallerFilter;
    const matchesRole = roleFilter === '' || call.role === roleFilter;
    
    const matchesSearch = recordingSearchQuery === '' || 
                         call.customerName.toLowerCase().includes(recordingSearchQuery.toLowerCase()) ||
                         call.fromNumber.includes(recordingSearchQuery) ||
                         call.toNumber.includes(recordingSearchQuery) ||
                         (call.recordingFilenames && call.recordingFilenames.some(f => 
                           f.toLowerCase().includes(recordingSearchQuery.toLowerCase())
                         ));
    
    return isInDateRange && matchesTelecaller && matchesRole && matchesSearch;
  });

  // Get the enhanced audio player component with improved error handling
  const EnhancedAudioPlayer = ({ src, filename, caller, customer, callDate, callTime, callDuration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackStarted, setPlaybackStarted] = useState(false);
    const audioRef = useRef(null);
    const playbackPromiseRef = useRef(null);
    
    // Handle play/pause with debouncing to prevent race conditions
    const handlePlayPause = () => {
      if (!audioRef.current) return;

      // If currently playing, pause immediately
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      
      // Don't allow multiple play attempts at once
      if (isLoading) return;
      
      setIsLoading(true);
      // Clear any existing promise
      if (playbackPromiseRef.current) {
        playbackPromiseRef.current = null;
      }
      
      try {
        // Start playback with a promise
        const playPromise = audioRef.current.play();
        
        // Modern browsers return a promise
        if (playPromise !== undefined) {
          playbackPromiseRef.current = playPromise;
          
          playPromise
            .then(() => {
              // Playback started successfully
              setIsPlaying(true);
              setPlaybackStarted(true);
              setIsLoading(false);
              playbackPromiseRef.current = null;
            })
            .catch(error => {
              // Playback was prevented
              console.error("Playback error:", error);
              setIsPlaying(false);
              setIsLoading(false);
              playbackPromiseRef.current = null;
              
              // Set audio error only for permission or network errors, not for pause interruptions
              if (error.name !== 'AbortError' || error.message !== 'The play() request was interrupted by a call to pause()') {
                setAudioError(true);
              }
            });
        } else {
          // Older browsers don't return a promise
          setIsPlaying(true);
          setPlaybackStarted(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during play attempt:", error);
        setIsPlaying(false);
        setAudioError(true);
        setIsLoading(false);
      }
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        setAudioError(false);
      }
    };
    
    const handleSeek = (e) => {
      if (!audioRef.current) return;
      
      const seekTime = parseFloat(e.target.value);
      const wasPlaying = !audioRef.current.paused;
      
      // If playing, pause before seeking to avoid race conditions
      if (wasPlaying) {
        audioRef.current.pause();
      }
      
      // Set the current time
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      // Resume playback if it was playing before
      if (wasPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error resuming after seek:", error);
          });
        }
      }
    };
    
    const handleVolumeChange = (e) => {
      if (!audioRef.current) return;
      
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    };
    
    const toggleMute = () => {
      if (!audioRef.current) return;
      
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
    
    const handleError = () => {
      console.error('Error loading audio:', src);
      setAudioError(true);
      setIsPlaying(false);
      setIsLoading(false);
    };
    
    // Clean up function for audio element
    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
        }
      };
    }, []);
    
    const formatTime = (time) => {
      if (isNaN(time)) return '00:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const extractDriveId = (url) => {
      const match = url.match(/[-\w]{25,}/);
      return match ? match[0] : null;
    };
    
    // Convert Google Drive link to direct download or streaming link
    const getPlayableUrl = (url) => {
      if (!url) return null;
      
      if (url.includes('drive.google.com/drive/folders')) {
        // Try to extract the folder ID from the URL
        const folderIdMatch = url.match(/drive\.google\.com\/drive\/folders\/([-\w]+)/);
        if (folderIdMatch && folderIdMatch[1]) {
          const folderId = folderIdMatch[1];
          // We can't get a direct audio URL from a folder, but we can link to the folder search
          return null;
        }
        return null;
      } else if (url.includes('drive.google.com/file/d/')) {
        // Extract file ID from format like https://drive.google.com/file/d/FILEID/view
        const fileIdMatch = url.match(/\/file\/d\/([-\w]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      } else if (url.includes('drive.google.com/open')) {
        // Extract ID from format like https://drive.google.com/open?id=FILEID
        const fileIdMatch = url.match(/[?&]id=([-\w]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      } else if (url.includes('drive.google.com')) {
        const fileId = extractDriveId(url);
        if (fileId) {
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }
      
      return url;
    };
    
    const playableUrl = getPlayableUrl(src);
    
    return (
      <div className="enhanced-audio-player">
        {audioError ? (
          <div className="audio-error">
            <div className="error-message">
              <FaVolumeUp className="error-icon" />
              <p>Unable to load audio recording. The file may not exist or requires authentication.</p>
            </div>
            <div className="error-actions">
              <a 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="open-drive-btn"
              >
                Open in Google Drive
              </a>
            </div>
          </div>
        ) : (
          <div className="player-container">
            <div className="player-info">
              <div className="call-details">
                <div className="call-participants">
                  <span className="caller">{caller || 'Staff'}</span>
                  <span className="call-direction">→</span>
                  <span className="customer">{customer || 'Customer'}</span>
                </div>
                <div className="call-time">
                  <span className="date">{callDate}</span>
                  <span className="time">{callTime}</span>
                  <span className="duration">{callDuration}</span>
                </div>
              </div>
              <div className="filename">{filename}</div>
            </div>
            
            <div className="player-controls">
              <button 
                className={`play-pause-btn ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`} 
                onClick={handlePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  isPlaying ? <FaPause /> : <FaPlay />
                )}
              </button>
              
              <div className="timeline-container">
                <span className="current-time">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  className="timeline"
                  value={currentTime}
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  onChange={handleSeek}
                />
                <span className="total-time">{formatTime(duration)}</span>
              </div>
              
              <div className="volume-container">
                <button 
                  className="mute-btn" 
                  onClick={toggleMute}
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  className="volume-slider"
                  value={volume}
                  min="0"
                  max="1"
                  step="0.01"
                  onChange={handleVolumeChange}
                />
              </div>
              
              <a 
                href={playableUrl || src} 
                download={filename || "recording.mp3"}
                className="download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDownload />
              </a>
            </div>
            
            <audio
              ref={audioRef}
              src={playableUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onError={handleError}
              style={{ display: 'none' }}
              preload="metadata"
            />
          </div>
        )}
      </div>
    );
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters and recalculate metrics
  const applyFilters = () => {
    calculateMetrics(callData);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setTelecallerFilter('');
    setSearchQuery('');
    setRoleFilter('');
  };

  // Date range filter presets
  const applyDateRangePreset = (preset) => {
    const today = new Date();
    let startDate = new Date();
    
    switch(preset) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        // Set to the first day of the current week (Sunday)
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        // Keep current dates
        return;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };
  
  // Get recordings tab content
  const getRecordingsTab = () => {
    return (
      <div className="recordings-tab">
        <div className="recordings-header">
          <h2>Call Recordings</h2>
          <div className="recordings-search">
            <input 
              type="text" 
              placeholder="Search recordings..." 
              value={recordingSearchQuery}
              onChange={(e) => setRecordingSearchQuery(e.target.value)}
              className="recording-search-input"
            />
            <div className="search-icon">
              <FaSearch />
            </div>
          </div>
        </div>
        
        <div className="recordings-summary">
          <p>
            Total Recordings: <strong>{filteredRecordings.length}</strong>
          </p>
        </div>
        
        <div className="recordings-list">
          {filteredRecordings.length > 0 ? (
            filteredRecordings.map((recording) => (
              <div key={recording.id} className="recording-item">
                <div className="recording-card">
                  <div className="recording-header">
                    <div className="recording-title">
                      <div className="call-type-badge" data-type={recording.callType.toLowerCase().replace(/\s+/g, '-')}>
                        {recording.callType === 'Incoming' ? <FaPhone /> : <FaPhoneSlash />}
                        {recording.callType}
                      </div>
                      <h3>{recording.customerName}</h3>
                    </div>
                    <div className="recording-meta">
                      <span className="recording-date">{new Date(recording.date).toLocaleDateString()}</span>
                      <span className="recording-time">{recording.time}</span>
                      <span className="recording-duration">{recording.duration}</span>
                    </div>
                  </div>
                  <div className="recording-controls">
                    <EnhancedAudioPlayer 
                      src={recording.primaryRecordingUrl} 
                      filename={recording.recordingFilenames?.[0] || `${recording.customerName}_${recording.date}_${recording.time}.mp3`}
                      caller={recording.telecaller}
                      customer={recording.customerName}
                      callDate={recording.date}
                      callTime={recording.time}
                      callDuration={recording.duration}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-recordings">
              <FaMicrophone className="no-recordings-icon" />
              <p>No recordings found for the selected filters.</p>
              <button onClick={resetFilters} className="btn btn-primary">Reset Filters</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add loading state with spinner
  if (loading) {
    return (
      <div className="dashboard-container loading-state">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading call analytics data...</p>
        </div>
      </div>
    );
  }

  // Add error state
  if (error) {
    return (
      <div className="dashboard-container error-state">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={fetchCallData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container call-analytics-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Call Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Track and analyze communication metrics</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchCallData} className="refresh-btn">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Refresh Data</span>
          </button>
        </div>
      </header>
      
      {/* Filters Section */}
      <div className="filters-section">
        <div className="section-header">
          <h2><FaFilter /> Filters</h2>
        </div>
        
        <div className="filters-grid">
          <div className="filter-panel">
            <div className="date-presets">
              <div className="filter-label"><FaCalendarAlt /> Date Range:</div>
              <div className="preset-buttons">
                <button onClick={() => applyDateRangePreset('today')} className="btn btn-sm">Today</button>
                <button onClick={() => applyDateRangePreset('yesterday')} className="btn btn-sm">Yesterday</button>
                <button onClick={() => applyDateRangePreset('thisWeek')} className="btn btn-sm">This Week</button>
                <button onClick={() => applyDateRangePreset('thisMonth')} className="btn btn-sm">This Month</button>
              </div>
            </div>
          </div>
          
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-group">
                <label><FaCalendarAlt /> Start Date:</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={dateRange.startDate} 
                  onChange={handleDateRangeChange} 
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label><FaCalendarAlt /> End Date:</label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={dateRange.endDate} 
                  onChange={handleDateRangeChange} 
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label><FaUserTie /> Role:</label>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="select-input"
                >
                  <option value="">All Roles</option>
                  <option value="telecaller">Telecallers</option>
                  <option value="salesCoordinator">Sales Coordinators</option>
                  <option value="salesman">Salesmen</option>
                  <option value="crm">CRM</option>
                </select>
              </div>
              <div className="filter-group">
                <label><FaUser /> Staff Member:</label>
                <select 
                  value={telecallerFilter} 
                  onChange={(e) => setTelecallerFilter(e.target.value)}
                  className="select-input"
                >
                  <option value="">All Staff</option>
                  {uniqueTelecallers.map(telecaller => (
                    <option key={telecaller} value={telecaller}>{telecaller}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="filter-panel">
            <div className="search-container">
              <div className="filter-group full-width">
                <label><FaSearch /> Search:</label>
                <div className="search-wrapper">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search by name, number or notes"
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>
              </div>
              <div className="filter-actions">
                <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
                <button onClick={resetFilters} className="btn btn-secondary">Reset</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="active-filters">
          {(dateRange.startDate !== new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] ||
           dateRange.endDate !== new Date().toISOString().split('T')[0] ||
           roleFilter !== '' ||
           telecallerFilter !== '' ||
           searchQuery !== '') && (
            <div className="filter-tags">
              <span className="filter-tag-label">Active Filters:</span>
              {dateRange.startDate !== new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] && (
                <span className="filter-tag">
                  From: {new Date(dateRange.startDate).toLocaleDateString()}
                </span>
              )}
              {dateRange.endDate !== new Date().toISOString().split('T')[0] && (
                <span className="filter-tag">
                  To: {new Date(dateRange.endDate).toLocaleDateString()}
                </span>
              )}
              {roleFilter !== '' && (
                <span className="filter-tag">
                  Role: {roleFilter}
                </span>
              )}
              {telecallerFilter !== '' && (
                <span className="filter-tag">
                  Staff: {telecallerFilter}
                </span>
              )}
              {searchQuery !== '' && (
                <span className="filter-tag">
                  Search: "{searchQuery}"
                </span>
              )}
              <button onClick={resetFilters} className="clear-filters-btn">Clear All</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Metrics Summary Section */}
      <div className="metrics-section">
        <div className="section-header">
          <h2>Call Summary Metrics</h2>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <h3>Total Calls</h3>
            <p className="metric-value">{metrics.totalCalls}</p>
            <p className="metric-trend">
              Period Average: {Math.round(metrics.totalCalls / Math.max(1, Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))))} per day
            </p>
          </div>
          <div className="metric-card incoming">
            <div className="metric-icon">📲</div>
            <h3>Incoming Calls</h3>
            <p className="metric-value">{metrics.incomingCalls}</p>
            <p className="metric-trend">
              {metrics.totalCalls > 0 ? Math.round((metrics.incomingCalls / metrics.totalCalls) * 100) : 0}% of total
            </p>
          </div>
          <div className="metric-card outgoing">
            <div className="metric-icon">📱</div>
            <h3>Outgoing Calls</h3>
            <p className="metric-value">{metrics.outgoingCalls}</p>
            <p className="metric-trend">
              {metrics.totalCalls > 0 ? Math.round((metrics.outgoingCalls / metrics.totalCalls) * 100) : 0}% of total
            </p>
          </div>
          <div className="metric-card missed">
            <div className="metric-icon">📵</div>
            <h3>Missed Calls</h3>
            <p className="metric-value">{metrics.missedCalls}</p>
            <p className="metric-trend">
              {metrics.totalCalls > 0 ? Math.round((metrics.missedCalls / metrics.totalCalls) * 100) : 0}% of total
            </p>
          </div>
          <div className="metric-card not-connected">
            <div className="metric-icon">🔇</div>
            <h3>Did Not Connect</h3>
            <p className="metric-value">{metrics.didNotConnectCalls}</p>
            <p className="metric-trend">
              {metrics.totalCalls > 0 ? Math.round((metrics.didNotConnectCalls / metrics.totalCalls) * 100) : 0}% of total
            </p>
          </div>
          <div className="metric-card duration">
            <div className="metric-icon">⏱️</div>
            <h3>Total Duration</h3>
            <p className="metric-value">{formatTotalDuration(metrics.totalDuration)}</p>
            <p className="metric-trend">
              {metrics.incomingCalls + metrics.outgoingCalls > 0 
                ? `${Math.round(metrics.totalDuration / 60)} minutes total`
                : 'No completed calls'
              }
            </p>
          </div>
          <div className="metric-card average">
            <div className="metric-icon">⌛</div>
            <h3>Average Call</h3>
            <p className="metric-value">{formatDuration(Math.round(metrics.avgDuration))}</p>
            <p className="metric-trend">
              {metrics.incomingCalls + metrics.outgoingCalls > 0 
                ? `${metrics.incomingCalls + metrics.outgoingCalls} completed calls`
                : 'No completed calls'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        <div className="section-header">
          <h2>Call Analytics Visualization</h2>
        </div>
        
        <div className="charts-grid">
          <div className="chart-card">
            <canvas ref={callTypeChartRef}></canvas>
          </div>
          <div className="chart-card">
            <canvas ref={callDurationChartRef}></canvas>
          </div>
          <div className="chart-card full-width">
            <canvas ref={telecallerPerformanceChartRef}></canvas>
          </div>
          <div className="chart-card full-width">
            <canvas ref={dailyCallsChartRef}></canvas>
          </div>
        </div>
      </div>
      
      {/* Tabs for Call Logs and Recordings */}
      <div className="data-tabs-container">
        <div className="section-header">
          <h2>Call Data</h2>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'callLogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('callLogs')}
          >
            <span className="tab-icon"><FaPhone /></span>
            Call Logs
            <span className="tab-count">{filteredCallLogs.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'recordings' ? 'active' : ''}`}
            onClick={() => setActiveTab('recordings')}
          >
            <span className="tab-icon"><FaMicrophone /></span>
            Call Recordings
            <span className="tab-count">{filteredRecordings.length}</span>
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'callLogs' ? (
            <div className="call-logs-tab">
              <div className="table-container">
                {filteredCallLogs.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Staff</th>
                        <th>Customer</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Duration</th>
                        <th>Type</th>
                        <th>Recording</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCallLogs.map(call => (
                        <tr key={call.id} className={`call-row ${call.callType.toLowerCase().replace(/\s+/g, '-')}`}>
                          <td>{new Date(call.date).toLocaleDateString()}</td>
                          <td>{call.time}</td>
                          <td>{call.telecaller}</td>
                          <td>{call.customerName}</td>
                          <td>{call.fromNumber}</td>
                          <td>{call.toNumber}</td>
                          <td>{call.duration}</td>
                          <td>
                            <span className={`call-type-badge ${call.callType.toLowerCase().replace(/\s+/g, '-')}`}>
                              {call.callType}
                            </span>
                          </td>
                          <td>
                            {call.primaryRecordingUrl ? (
                              <EnhancedAudioPlayer 
                                src={call.primaryRecordingUrl} 
                                filename={call.recordingFilenames?.[0] || ''}
                                caller={call.telecaller}
                                customer={call.customerName}
                                callDate={call.date}
                                callTime={call.time}
                                callDuration={call.duration}
                              />
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data-message">
                    <div className="no-data-icon">📞</div>
                    <p>No call logs match your current filters.</p>
                    <button onClick={resetFilters} className="btn btn-primary">Reset Filters</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            getRecordingsTab()
          )}
        </div>
      </div>
    </div>
  );
};

export default CallAnalyticsDashboard; 