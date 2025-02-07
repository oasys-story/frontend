import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
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
  const [errorMessage, setErrorMessage] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  // 사용자 권한 확인 (ADMIN, MANAGER, USER)
  const userRole = localStorage.getItem('role')?.toUpperCase();
  const isAdminOrManager = userRole === 'ADMIN' || userRole === 'MANAGER';

  // 메뉴 아이템 필터링
  const menuItems = [
    // 메인 메뉴
    {
      category: '메인',
      items: [
        { text: '홈', path: '/' }
      ]
    },
    // 점검 관련 메뉴
    {
      category: '점검',
      items: [
        { text: '점검 시작하기', path: '/inspection', requireAuth: true },
        { text: '전기 점검 목록', path: '/inspections', requireAuth: true },
        { text: '소방 점검 목록', path: '/fire-safety-inspections', requireAuth: true }
      ]
    },
    // 게시판 메뉴
    {
      category: '게시판',
      items: [
        { text: '공지사항', path: '/notices' },
        { text: '문의사항', path: '/inquiries' },
        { text: '고객센터', path: '/customer' }
      ]
    },
    // 관리자 메뉴 (ADMIN과 MANAGER만 볼 수 있음)
    ...(isAdminOrManager ? [{
      category: '일정/관리',
      items: [
        { text: '일정 관리', path: '/schedule-management' },
        { text: '업체 관리', path: '/companies' },
        { text: '사용자 관리', path: '/users' },
        { text: '설정', path: '/settings/dashboard' }
      ]
    }] : [])
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

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setLoginDialogOpen(false);
        setErrorMessage({ username: '', password: '' });

        setSnackbar({
          open: true,
          message: '로그인되었습니다.',
          severity: 'success'
        });
      } else {
        if (data.message === "존재하지 않는 사용자입니다.") {
          setErrorMessage({
            username: data.message,
            password: ''
          });
        } else if (data.message === "비밀번호가 틀렸습니다.") {
          setErrorMessage({
            username: '',
            password: data.message
          });
        }
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

      // 홈으로 이동 추가
      navigate('/');
      
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

  // useEffect 추가
  useEffect(() => {
    const handleOpenLoginDialog = () => {
      setLoginDialogOpen(true);
    };

    window.addEventListener('openLoginDialog', handleOpenLoginDialog);

    return () => {
      window.removeEventListener('openLoginDialog', handleOpenLoginDialog);
    };
  }, []);

  return (
    <>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1200,
          color: '#1C243A',
          '@media (min-width: 430px)': {
            left: 'calc((100% - 430px) / 2 + 16px)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: '70%',  // 모바일에서는 화면의 80%
            maxWidth: '320px',  // 최대 너비 제한
            '@media (min-width: 430px)': {
              left: 'calc((100% - 430px) / 2)',  // 모바일 컨테이너 내부에 위치
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ width: '100%' }} role="presentation">
          <Box sx={{ p: 2, bgcolor: '#1C243A' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              AS 센터
            </Typography>
          </Box>
          
          {menuItems.map((category, index) => (
            <React.Fragment key={index}>
              {/* 카테고리 제목 */}
              <Typography
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                {category.category}
              </Typography>
              
              {/* 카테고리 항목들 */}
              <List disablePadding>
                {category.items.map((item) => (
                  <ListItem
                    key={item.text}
                    button
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      pl: 3,  // 들여쓰기
                      py: 1,  // 높이 줄임
                      '&:hover': {
                        bgcolor: 'rgba(75, 119, 216, 0.08)',
                      },
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
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: '0.9rem',
                          color: '#2A2A2A',
                          fontWeight: 500
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          {/* 로그인/로그아웃 버튼 */}
          <Divider />
          <ListItem
            button
            onClick={() => user ? handleLogout() : setLoginDialogOpen(true)}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(75, 119, 216, 0.08)',
              }
            }}
          >
            <ListItemText 
              primary={user ? '로그아웃' : '로그인'} 
              secondary={user ? user.fullName : null}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: '#2A2A2A',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }
              }}
            />
          </ListItem>
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
            onChange={(e) => {
              setLoginData({...loginData, username: e.target.value});
              setErrorMessage({...errorMessage, username: ''});
            }}
            error={Boolean(errorMessage.username)}
            helperText={errorMessage.username}
          />
          <TextField
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={loginData.password}
            onChange={(e) => {
              setLoginData({...loginData, password: e.target.value});
              setErrorMessage({...errorMessage, password: ''});
            }}
            error={Boolean(errorMessage.password)}
            helperText={errorMessage.password}
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