import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const iconClass = 'w-5 h-5';

const HomeIcon = () => (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V21h14V9.5" />
  </svg>
);

const FlaskIcon = () => (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 3h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v5l-5.5 9A2 2 0 006.2 20h11.6a2 2 0 001.7-3l-5.5-9V3" />
  </svg>
);

const UsersIcon = () => (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19a6 6 0 0112 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 19a4.5 4.5 0 018.5 0" />
  </svg>
);

const ChartIcon = () => (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
    <rect x="6" y="11" width="3" height="7" />
    <rect x="11" y="8" width="3" height="10" />
    <rect x="16" y="5" width="3" height="13" />
  </svg>
);

const GraduationIcon = () => (
  <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-4 9 4-9 4-9-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10v5" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l8 14H4L12 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Assess', path: '/assess', icon: <FlaskIcon /> },
    { name: 'Students', path: '/students', icon: <UsersIcon /> },
    { name: 'Dashboard', path: '/dashboard', icon: <ChartIcon /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:justify-between sm:items-center sm:py-4">
            <div className="flex items-center space-x-3">
              <div>
                <GraduationIcon />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                  Intelligent Learning Disability Recognition System
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">Educational Assessment Tool</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Offline Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-6 overflow-x-auto whitespace-nowrap">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    inline-flex items-center space-x-2 px-3 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors
                    ${isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <WarningIcon /> <strong>Educational Screening Only</strong> - Not a diagnostic tool
            </p>
            <p>&copy; 2026 Learning Disability Screening System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
