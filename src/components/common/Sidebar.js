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
  Button
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

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const menuItems = [
    { text: '홈', icon: <HomeIcon />, path: '/' },
    { text: '점검 시작하기', icon: <AssignmentIcon />, path: '/inspection' },
    { text: '점검 목록', path: '/inspections', icon: <ListAltIcon />},
    { text: '공지사항', icon: <NotificationsIcon />, path: '/notices' },
    { text: '문의사항', icon: <QuestionAnswerIcon />, path: '/inquiries' },
    { text: '업체 관리', icon: <BusinessIcon />, path: '/companies' },
    { text: '사용자 관리', icon: <PeopleIcon />, path: '/users' },
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
        // console.log('Login response:', data);  // 응답 데이터 구조 확인
        
        // 응답 구조에 맞게 수정
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setLoginDialogOpen(false);
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleMenuClick = (item) => {
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
                  }
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

      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
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
          <Button onClick={() => setLoginDialogOpen(false)}>취소</Button>
          <Button onClick={handleLogin}>로그인</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar; 