import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Link,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Carousel from 'react-material-ui-carousel';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Home = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // 캐러셀 아이템
  const carouselItems = [
    {
      image: "/images/company1.jpg",
      title: "안전한 작업환경 구축",
      description: "최고의 안전 관리 시스템"
    },
    {
      image: "/images/company2.jpg",
      title: "24시간 모니터링",
      description: "실시간 안전 점검"
    },
  ];

  useEffect(() => {
    // 공지사항과 문의사항 데이터 가져오기
    fetchNotices();
    fetchInquiries();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.slice(0, 4)); // 최근 4개만
      }
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/inquiries');
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.slice(0, 4)); // 최근 4개만
      }
    } catch (error) {
      console.error('문의사항 로딩 실패:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <Box sx={{ 
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* 상단 로고 영역 */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #eee'
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', minHeight: '60px' }}>
          <Box
            component="img"
            src="/images/oasys.png"
            alt="로고"
            sx={{
              height: '50px',
              width: 'auto',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          />
        </Toolbar>
      </AppBar>

      {/* 메인 컨텐츠 영역 */}
      <Box sx={{ mt: 2 , p: 2, flex: 1 }}>
        {/* 캐러셀 영역 */}
        <Carousel
          animation="slide"
          indicators={true}
          navButtonsAlwaysVisible={false}
          interval={5000}  // 5초마다 자동 슬라이드
          navButtonsProps={{
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              color: '#000',
              padding: '5px',
              margin: '0 10px'
            }
          }}
          indicatorContainerProps={{
            style: {
              marginTop: '10px',
              textAlign: 'center'
            }
          }}
          sx={{ 
            mb: 4, 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {carouselItems.map((item, index) => (
            <Paper
              key={index}
              sx={{
                height: '200px',
                position: 'relative',
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))',
                  zIndex: 1
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  zIndex: 2,
                  color: 'white'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    mt: 0.5,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Carousel>

        {/* 게시판 영역 */}
        <Grid container spacing={2}>
          {/* 문의사항 */}
          <Grid item xs={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2,
                height: '300px',
                border: '1px solid #eee',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  문의사항
                </Typography>
                <Link 
                  onClick={() => navigate('/inquiries')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  더보기 <ArrowForwardIosIcon sx={{ fontSize: '0.875rem', ml: 0.5 }} />
                </Link>
              </Box>
              <List sx={{ p: 0 }}>
                {inquiries.map((inquiry, index) => (
                  <React.Fragment key={inquiry.inquiryId}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary={inquiry.inquiryTitle}
                        secondary={formatDate(inquiry.createdAt)}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          noWrap: true
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem'
                        }}
                      />
                    </ListItem>
                    {index < inquiries.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 공지사항 */}
          <Grid item xs={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2,
                height: '300px',
                border: '1px solid #eee',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  공지사항
                </Typography>
                <Link 
                  onClick={() => navigate('/notices')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  더보기 <ArrowForwardIosIcon sx={{ fontSize: '0.875rem', ml: 0.5 }} />
                </Link>
              </Box>
              <List sx={{ p: 0 }}>
                {notices.map((notice, index) => (
                  <React.Fragment key={notice.noticeId}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary={notice.title}
                        secondary={formatDate(notice.createdAt)}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          noWrap: true
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem'
                        }}
                      />
                    </ListItem>
                    {index < notices.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home; 