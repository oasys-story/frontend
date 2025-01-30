import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';

import Dashboard from './Dashboard';
import Schedule from './Schedule';
import Notifications from './Notifications';
import Reports from './Reports';
import Categories from './Categories';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/settings/dashboard', icon: <DashboardIcon />, label: '대시보드' },
    { path: '/settings/schedule', icon: <CalendarMonthIcon />, label: '일정' },
    { path: '/settings/notifications', icon: <NotificationsIcon />, label: '알림' },
    { path: '/settings/reports', icon: <AssessmentIcon />, label: '보고서' },
    { path: '/settings/categories', icon: <BusinessIcon />, label: '분류' },
  ];

  return (
    <Box sx={{ pb: 7 }}>  {/* 하단 네비게이션 공간 확보 */}
      {/* 컨텐츠 영역 */}
      <Box sx={{  pl: 2, pr: 2, pb: 2, mb: 7 }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="categories" element={<Categories />} />
        </Routes>
      </Box>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '430px',
          margin: '0 auto',
          borderTop: '1px solid #eee',
          height: 56,
          backgroundColor: 'white',
        }}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            value={item.path}
            icon={item.icon}
            label={item.label}
            sx={{
              minWidth: 'auto',
              padding: '6px 0',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem'
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default Settings; 