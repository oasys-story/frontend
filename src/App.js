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
import ScheduleManagement from './pages/ScheduleManagement';
import FireSafetyInspectionForm from './components/fireSafetyInspection/FireSafetyInspectionForm';
import ServicePreparingPage from './components/common/ServicePreparingPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminInquiryList from './components/inquiry/AdminInquiryList';
import ContractList from './components/contract/ContractList';
import ContractUpload from './components/contract/ContractUpload';
import ContractDetail from './components/contract/ContractDetail';

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
const CustomerCenter = React.lazy(() => import('./components/customer/CustomerCenter'));
const FireSafetyInspectionResult = React.lazy(() => import('./components/fireSafetyInspection/FireSafetyInspectionResult'));
const FireSafetyInspectionList = React.lazy(() => import('./components/fireSafetyInspection/FireSafetyInspectionList'));
const FireSafetyInspectionEdit = React.lazy(() => import('./components/fireSafetyInspection/FireSafetyInspectionEdit'));
const OnboardingHome = React.lazy(() => import('./components/tutorial/OnboardingHome'));
const SiteIntroTutorial = React.lazy(() => import('./components/tutorial/SiteIntroTutorial'));
const SignUpTutorial = React.lazy(() => import('./components/tutorial/SignUpTutorial'));
const ElectricalInspectionTutorial = React.lazy(() => import('./components/tutorial/ElectricalInspectionTutorial'));
const FireInspectionTutorial = React.lazy(() => import('./components/tutorial/FireInspectionTutorial'));
const InquiryTutorial = React.lazy(() => import('./components/tutorial/InquiryTutorial'));
const PdfTutorial = React.lazy(() => import('./components/tutorial/PdfTutorial'));
const InspectionResultTransmissionTutorial = React.lazy(() => import('./components/tutorial/InspectionResultTransmissionTutorial'));
const KakaoAlertList = React.lazy(() => import('./components/alert/KakaoAlertList'));
const GuestInquiryList = React.lazy(() => import('./components/inquiry/GuestInquiryList'));

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
                  <Route path="/customer/*" element={<CustomerCenter />} />
                  <Route path="/schedule-management" element={<ScheduleManagement />} />
                  <Route path="/fire-safety-inspection" element={<FireSafetyInspectionForm />} />
                  <Route path="/fire-safety-inspection/edit/:id" element={<FireSafetyInspectionForm />} />
                  <Route path="/fire-safety-inspection/:id" element={<FireSafetyInspectionResult />} />
                  <Route path="/fire-safety-inspections" element={<FireSafetyInspectionList />} />
                  <Route path="/inspection/facility" element={<ServicePreparingPage />} />
                  <Route path="/inspection/equipment" element={<ServicePreparingPage />} />
                  <Route path="/tutorial-onboarding" element={<OnboardingHome />} />
                  <Route path="/tutorial/tutorial-site-intro" element={<SiteIntroTutorial />} />
                  <Route path="/tutorial/signup" element={<SignUpTutorial />} />
                  <Route path="/tutorial/electrical-inspection" element={<ElectricalInspectionTutorial />} />
                  <Route path="/tutorial/fire-inspection" element={<FireInspectionTutorial />} />
                  <Route path="/tutorial/inquiry" element={<InquiryTutorial />} />
                  <Route path="/tutorial/pdf" element={<PdfTutorial />} />
                  <Route path="/tutorial/send-results" element={<InspectionResultTransmissionTutorial />} />
                  <Route path="/kakao-alert-list" element={<KakaoAlertList />} />
                  <Route path="/guest-inquiries" element={<GuestInquiryList />} />
                  <Route 
                    path="/admin/inquiries" 
                    element={
                      <ProtectedRoute roleRequired="ADMIN">
                        <AdminInquiryList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/contracts" 
                    element={
                      <ProtectedRoute>
                        <ContractList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/contracts/:id"
                    element={
                      <ProtectedRoute>
                        <ContractDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/contract/upload" 
                    element={
                      <ProtectedRoute>
                        <ContractUpload />
                      </ProtectedRoute>
                    } 
                  />
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