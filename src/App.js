import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { Box } from '@mui/material';
import InspectionForm from './components/inspection/InspectionForm';
import InspectionResult from './components/inspection/InspectionResult';
import MainHome from './components/Home';
import SafetyEducation from './components/safety/SafetyEducation';
import Sidebar from './components/common/Sidebar';
import CompanyList from './components/company/CompanyList';
import UserList from './components/user/UserList';
import UserManagement from './pages/UserManagement';
import CompanyManagement from './pages/CompanyManagement';
import InspectionList from './components/inspection/InspectionList';
import NoticeList from './components/notice/NoticeList';
import InquiryList from './components/inquiry/InquiryList';
import './App.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InspectionHome from './components/inspection/InspectionHome';

function App() {
  return (
    <ThemeProvider theme={theme}>
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
          <Router>
            <Sidebar />
            <Routes>
              <Route path="/" element={<MainHome />} />
              <Route path="/inspection" element={<InspectionHome />} />
              <Route path="/inspection/safety" element={<SafetyEducation />} />
              <Route path="/inspection/new" element={<InspectionForm />} />
              <Route path="/inspection/:id" element={<InspectionResult />} />
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/:companyId" element={<CompanyManagement />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:userId" element={<UserManagement />} />
              <Route path="/inspections" element={<InspectionList />} />
              <Route path="/notices" element={<NoticeList />} />
              <Route path="/inquiries" element={<InquiryList />} />
            </Routes>
          </Router>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 