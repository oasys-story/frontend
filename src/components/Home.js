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
  Toolbar,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Carousel from 'react-material-ui-carousel';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NoticeDetailModal from './notice/NoticeDetailModal';
import InquiryDetailModal from './inquiry/InquiryDetailModal';

const Home = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [openInquiryModal, setOpenInquiryModal] = useState(false);

  // 캐러셀 아이템
  const carouselItems = [
    {
      image: "/images/safe2.png",
      title: "안전한 작업환경 구축",
      description: "최고의 안전 관리 시스템"
    },
    {
      image: "/images/safe.png",
      title: "24시간 모니터링",
      description: "실시간 안전 점검"
    },
  ];

  useEffect(() => {
    // 공지사항과 문의사항 데이터 가져오기
    Promise.all([fetchNotices(), fetchInquiries()])
      .finally(() => setLoading(false));
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.slice(0, 4));
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

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNotice(null);
  };

  const handleInquiryClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenInquiryModal(true);
  };

  const handleCloseInquiryModal = () => {
    setOpenInquiryModal(false);
    setSelectedInquiry(null);
  };

  return (
    <Box sx={{ 
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #FFFFFF, #F8F9FA)',
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* 상단 로고 영역 */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.95))',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', minHeight: '60px' }}>
          <Box
            component="img"
            src="/images/dawoo2.png"
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
        {loading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        ) : (
          <Carousel
            animation="slide"
            indicators={true}
            navButtonsAlwaysVisible={false}
            interval={5000}
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              overflow: 'hidden',
              boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
              '& .MuiPaper-root': {
                height: '240px',  // 조금 더 높게
              },
              '& .MuiButton-root': {
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover .MuiButton-root': {
                opacity: 1
              }
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
                      color: '#FFFFFF',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
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
        )}

        {/* 게시판 영역 */}
        <Grid container spacing={2.5}>
          {/* 문의사항 */}
          <Grid item xs={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5,
                height: '320px',  // 높이 살짝 늘림
                border: '1px solid #eee',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}>
                  문의사항
                </Typography>
                <Link 
                  onClick={() => navigate('/inquiries')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.775rem',
                    '&:hover': { 
                      color: 'primary.main'
                    }
                  }}
                >
                  더보기 <ArrowForwardIosIcon sx={{ fontSize: '0.775rem', ml: 0.5 }} />
                </Link>
              </Box>
              <List sx={{ p: 0 }}>
                {inquiries.map((inquiry, index) => (
                  <React.Fragment key={inquiry.inquiryId}>
                    <ListItem 
                      sx={{ 
                        px: 1.5,
                        py: 1,
                        transition: 'all 0.2s ease',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          transform: 'translateX(4px)'
                        }
                      }}
                      onClick={() => handleInquiryClick(inquiry)}
                    >
                      <ListItemText 
                        primary={inquiry.inquiryTitle}
                        secondary={formatDate(inquiry.createdAt)}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '0.875rem',
                            color: 'text.primary',
                            fontWeight: 500,
                            noWrap: true
                          }
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            mt: 0.5
                          }
                        }}
                      />
                    </ListItem>
                    {index < inquiries.length - 1 && 
                      <Divider sx={{ my: 1, opacity: 0.6 }} />
                    }
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
                p: 2.5,
                height: '320px',
                border: '1px solid #eee',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}>
                  공지사항
                </Typography>
                <Link 
                  onClick={() => navigate('/notices')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.775rem',
                    '&:hover': { 
                      color: 'primary.main'
                    }
                  }}
                >
                  더보기 <ArrowForwardIosIcon sx={{ fontSize: '0.775rem', ml: 0.5 }} />
                </Link>
              </Box>
              <List sx={{ p: 0 }}>
                {notices.map((notice, index) => (
                  <React.Fragment key={notice.noticeId}>
                    <ListItem 
                      sx={{ 
                        px: 1.5,
                        py: 1,
                        transition: 'all 0.2s ease',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          transform: 'translateX(4px)'
                        }
                      }}
                      onClick={() => handleNoticeClick(notice)}
                    >
                      <ListItemText 
                        primary={notice.title}
                        secondary={formatDate(notice.createdAt)}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '0.875rem',
                            color: 'text.primary',
                            fontWeight: 500,
                            noWrap: true
                          }
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            mt: 0.5
                          }
                        }}
                      />
                    </ListItem>
                    {index < notices.length - 1 && 
                      <Divider sx={{ my: 1, opacity: 0.6 }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <InquiryDetailModal 
        open={openInquiryModal}
        inquiry={selectedInquiry}
        onClose={handleCloseInquiryModal}
      />

      <NoticeDetailModal 
        open={openModal}
        notice={selectedNotice}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default Home; 