import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from './components/common/Sidebar';
import MainHome from './components/Home';
import './App.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StyledEngineProvider } from '@mui/material/styles';

// 지연 로딩할 컴포넌트들
const Settings = React.lazy(() => import('./components/settings/Settings'));
const InspectionForm = React.lazy(() => import('./components/inspection/InspectionForm'));
const InspectionResult = React.lazy(() => import('./components/inspection/InspectionResult'));
const InspectionEdit = React.lazy(() => import('./components/inspection/InspectionEdit'));
const SafetyEducation = React.lazy(() => import('./components/safety/SafetyEducation'));
const CompanyList = React.lazy(() => import('./components/company/CompanyList'));
const UserList = React.lazy(() => import('./components/user/UserList'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const CompanyManagement = React.lazy(() => import('./pages/CompanyManagement'));
const InspectionList = React.lazy(() => import('./components/inspection/InspectionList'));
const NoticeList = React.lazy(() => import('./components/notice/NoticeList'));
const InquiryList = React.lazy(() => import('./components/inquiry/InquiryList'));
const InspectionHome = React.lazy(() => import('./components/inspection/InspectionHome'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh'
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{
                maxWidth: '430px',
                margin: '0 auto',
                minHeight: '100vh',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#FFFFFF',
                position: 'relative'
              }}
            >
              <Sidebar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<MainHome />} />
                  <Route path="/inspection" element={<InspectionHome />} />
                  <Route path="/inspection/safety" element={<SafetyEducation />} />
                  <Route path="/inspection/new" element={<InspectionForm />} />
                  <Route path="/inspection/:id" element={<InspectionResult />} />
                  <Route path="/inspection/edit/:id" element={<InspectionEdit />} />
                  <Route path="/companies" element={<CompanyList />} />
                  <Route path="/companies/:companyId" element={<CompanyManagement />} />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/:userId" element={<UserManagement />} />
                  <Route path="/inspections" element={<InspectionList />} />
                  <Route path="/notices" element={<NoticeList />} />
                  <Route path="/inquiries" element={<InquiryList />} />
                  <Route path="/settings/*" element={<Settings />}/>
                </Routes>
              </Suspense>
            </Box>
          </LocalizationProvider>
        </ThemeProvider>
      </Router>
    </StyledEngineProvider>
  );
}

export default App; 