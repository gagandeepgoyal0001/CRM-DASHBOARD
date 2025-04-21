// src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import './styles/style.css';

// Lazy load the page components
const Home = React.lazy(() => import('./scripts/home'));
const TelecallerDashboard = React.lazy(() => import('./scripts/telecallerDashboard'));
const SalesCoordinatorDashboard = React.lazy(() => import('./scripts/salesCoordinatorDashboard'));
const SalesmanDashboard = React.lazy(() => import('./scripts/salesmanDashboard'));
const CallAnalyticsDashboard = React.lazy(() => import('./scripts/callAnalytics'));

// Map page keys to components and their CSS files
const pageComponents = {
  home: Home,
  telecaller: TelecallerDashboard,
  salesCoordinator: SalesCoordinatorDashboard,
  salesman: SalesmanDashboard,
  callAnalytics: CallAnalyticsDashboard,
};

const pageCSS = {
  home: 'styles/home.css',
  telecaller: 'styles/telecallerDashboard.css',
  salesCoordinator: 'styles/salesCoordinatorDashboard.css',
  salesman: 'styles/salesmanDashboard.css',
  callAnalytics: 'styles/telecallerDashboard.css',
};

function App() {
  // Check URL query parameters for initial page
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    return pageComponents[page] ? page : 'home';
  };
  
  // Active page state (default to URL param or 'home' as the landing page)
  const [activePage, setActivePage] = useState(getInitialPage());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamically load page-specific CSS when activePage changes
  useEffect(() => {
    // Remove previously loaded CSS with the 'page-specific' class
    document.querySelectorAll('link.page-specific').forEach((link) => link.remove());
    const href = pageCSS[activePage];
    if (href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.classList.add('page-specific');
      document.head.appendChild(link);
    }
    
    // Update URL query parameter
    const url = new URL(window.location);
    url.searchParams.set('page', activePage);
    window.history.pushState({}, '', url);
    
    // Update document title based on current page
    document.title = `CRM Dashboard | ${activePage.charAt(0).toUpperCase() + activePage.slice(1)}`;
  }, [activePage]);
  
  // Add event listener for custom navigation events from child components
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      if (event.detail && event.detail.page && pageComponents[event.detail.page]) {
        setActivePage(event.detail.page);
      }
    };
    
    // Add event listener
    document.addEventListener('navigate', handleNavigationEvent);
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup
    return () => {
      document.removeEventListener('navigate', handleNavigationEvent);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Toggle sidebar collapse
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Get the active component (default to Home if key is not found)
  const ActiveComponent = pageComponents[activePage] || Home;

  // Handle navigation
  const navigate = (page) => (e) => {
    e.preventDefault();
    setActivePage(page);
  };

  return (
    <div id="appContainer" className="app-container">
      {/* Sidebar Navigation */}
      <nav id="sidebar" className={sidebarCollapsed ? 'collapsed' : ''}>
        <div className="sidebar-header">
          <h2>CRM Dashboard</h2>
          <button id="toggleSidebar" onClick={toggleSidebar}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <ul id="navMenu">
          <li className={activePage === 'home' ? 'active' : ''}>
            <a href="#" onClick={navigate('home')} data-page="home">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </a>
          </li>
          <li className={activePage === 'telecaller' ? 'active' : ''}>
            <a href="#" onClick={navigate('telecaller')} data-page="telecaller">
              <span className="nav-icon">📞</span>
              <span className="nav-label">Telecaller Dashboard</span>
            </a>
          </li>
          <li className={activePage === 'salesCoordinator' ? 'active' : ''}>
            <a href="#" onClick={navigate('salesCoordinator')} data-page="salesCoordinator">
              <span className="nav-icon">👨‍💼</span>
              <span className="nav-label">Sales Coordinator</span>
            </a>
          </li>
          <li className={activePage === 'salesman' ? 'active' : ''}>
            <a href="#" onClick={navigate('salesman')} data-page="salesman">
              <span className="nav-icon">🤵</span>
              <span className="nav-label">Salesman Dashboard</span>
            </a>
          </li>
          <li className={activePage === 'callAnalytics' ? 'active' : ''}>
            <a href="#" onClick={navigate('callAnalytics')} data-page="callAnalytics">
              <span className="nav-icon">📊</span>
              <span className="nav-label">Call Analytics</span>
            </a>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} CRM System</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <div id="content">
        <div className="content-header">
          <h1>{activePage === 'home' ? 'Dashboard Overview' : `${activePage.charAt(0).toUpperCase() + activePage.slice(1)} Dashboard`}</h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              Refresh Data
            </button>
            <button 
              className="share-btn" 
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url)
                  .then(() => alert('Dashboard link copied to clipboard!'))
                  .catch(() => alert('Failed to copy link. Please copy the URL from your address bar.'));
              }}
            >
              Share Dashboard
            </button>
          </div>
        </div>
        
        <div className="content-body">
          <Suspense fallback={
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading dashboard...</p>
            </div>
          }>
            <ActiveComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
