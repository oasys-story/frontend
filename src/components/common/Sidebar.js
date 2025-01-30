import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  // 사용자 권한 확인
  const isAdmin = localStorage.getItem('role')?.toUpperCase() === 'ADMIN';

  // 메뉴 아이템 필터링
  const menuItems = [
    { text: '홈', icon: <HomeIcon />, path: '/' },
    { text: '점검 시작하기', icon: <AssignmentIcon />, path: '/inspection', requireAuth: true },
    { text: '점검 목록', path: '/inspections', icon: <ListAltIcon />, requireAuth: true },
    { text: '공지사항', icon: <NotificationsIcon />, path: '/notices' },
    { text: '문의사항', icon: <QuestionAnswerIcon />, path: '/inquiries' },
    // ADMIN 전용 메뉴
    ...(isAdmin ? [
      { text: '업체 관리', icon: <BusinessIcon />, path: '/companies' },
      { text: '사용자 관리', icon: <PeopleIcon />, path: '/users' },
      {
        icon: <SettingsIcon />,
        text: '설정',
        path: '/settings/dashboard',  // 설정의 대시보드로 바로 이동
        roles: ['ADMIN']
      }
    ] : [])
  ];

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setLoginDialogOpen(false);

        // 로그인 성공 메시지
        setSnackbar({
          open: true,
          message: '로그인되었습니다.',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: '로그인에 실패했습니다.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      setSnackbar({
        open: true,
        message: '로그인 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // 로컬 스토리지 초기화
      localStorage.clear();
      
      // 상태 초기화
      setUser(null);
      
      // 로그인 폼 초기화 추가
      resetLoginForm();
      
      // 로그아웃 성공 메시지
      setSnackbar({
        open: true,
        message: '로그아웃되었습니다.',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
      setSnackbar({
        open: true,
        message: '로그아웃 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleMenuClick = (item) => {
    // 로그인 필요한 메뉴 체크
    if (item.requireAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: '로그인 후 이용해 주세요.',
          severity: 'warning'
        });
        setOpen(false);  // 사이드바 닫기
        return;
      }
    }

    // 기존 로직
    if (item.text === '로그인/로그아웃') {
      if (user) {
        handleLogout();
      } else {
        setLoginDialogOpen(true);
      }
    } else {
      handleNavigate(item.path);
    }
    setOpen(false);
  };

  // 로그인 입력 필드 초기화 함수
  const resetLoginForm = () => {
    setLoginData({
      username: '',
      password: ''
    });
  };

  // 로그인 모달 닫기 핸들러
  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false);
    resetLoginForm();  // 모달 닫을 때 입력 필드 초기화
  };

  // 테스트용 API 호출 함수 추가
//   const testAuthenticatedRequest = async () => {
//     const token = localStorage.getItem('token');
//     try {
//       const response = await fetch('http://localhost:8080/api/users', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
//       console.log('Protected API Response:', data);
//     } catch (error) {
//       console.error('API Request Failed:', error);
//     }
//   };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
        sx={{ 
          position: 'fixed',
          left: 16,
          top: 16,
          zIndex: 1200,
          '& .MuiSvgIcon-root': {
            color: '#2A2A2A'
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <Box sx={{ p: 2, bgcolor: '#1C243A' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              AS 센터
            </Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item)}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(75, 119, 216, 0.08)',
                  },
                  // 로그인 필요한 메뉴 스타일
                  ...(item.requireAuth && !localStorage.getItem('token') && {
                    opacity: 0.6,
                    '&::after': {
                      content: '"*"',
                      color: 'warning.main',
                      ml: 1
                    }
                  })
                }}
              >
                <ListItemIcon sx={{ color: '#1C243A' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: '#2A2A2A',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItem>
            ))}
            <Divider />
            <ListItem
              button
              onClick={() => user ? handleLogout() : setLoginDialogOpen(true)}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(75, 119, 216, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#1C243A' }}>
                {user ? <LogoutIcon /> : <PersonIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={user ? '로그아웃' : '로그인'} 
                secondary={user ? user.fullName : null}
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: '#2A2A2A',
                    fontWeight: 500
                  }
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Dialog 
        open={loginDialogOpen} 
        onClose={handleCloseLoginDialog}
      >
        <DialogTitle>로그인</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="아이디"
            type="text"
            fullWidth
            value={loginData.username}
            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
          />
          <TextField
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginDialog}>취소</Button>
          <Button onClick={handleLogin}>로그인</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: 3,
            fontSize: '0.95rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar; 