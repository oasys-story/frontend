import React from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SecurityIcon from '@mui/icons-material/Security';
import EngineeringIcon from '@mui/icons-material/Engineering';

const InspectionHome = () => {
  const navigate = useNavigate();

  const inspectionTypes = [
    {
      id: 'electric',
      title: '전기설비 점검',
      description: '전기 안전 점검을 시작합니다',
      icon: ElectricBoltIcon,
      color: '#2196F3',
      path: '/inspection/safety'
    },
    {
      id: 'fire',
      title: '소방시설 점검',
      description: '소방 안전 점검을 시작합니다',
      icon: LocalFireDepartmentIcon,
      color: '#F44336',
      path: '/fire-safety-inspection'
    },
    {
      id: 'safety',
      title: '안전시설 점검',
      description: '시설물 안전 점검을 시작합니다',
      icon: SecurityIcon,
      color: '#4CAF50',
      path: '/inspection/facility'
    },
    {
      id: 'equipment',
      title: '기계설비 점검',
      description: '기계 설비 점검을 시작합니다',
      icon: EngineeringIcon,
      color: '#FF9800',
      path: '/inspection/equipment'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* 헤더 수정 */}
      <Box sx={{ 
        position: 'sticky',   
        top: 0, 
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #eee',
        zIndex: 1,
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6">시설물 점검</Typography>
      </Box>

      {/* 메인 컨텐츠 */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          py: 3,
          px: 2
        }}
      >
        {/* 상단 배너 섹션 수정 */}
        <Box sx={{ 
          mb: 4, 
          textAlign: 'center',
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#FFF',
          boxShadow: '0 8px 32px rgba(0,0,0,0.03)'
        }}>
          {/* 배경 이미지 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'url("/images/checklist-banner.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1
            }}
          />
          
          <Box sx={{ 
            position: 'relative',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>


            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#666',
                fontSize: '1rem',
                maxWidth: '80%',
                lineHeight: 1.6,
                mt: 3,
                mb: 3
              }}
            >
              안전하고 체계적인 점검을 위해<br />
              아래 항목 중 선택해주세요
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {inspectionTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Grid item xs={6} key={type.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${type.color}08 0%, ${type.color}03 100%)`,
                    border: '1px solid',
                    borderColor: `${type.color}15`,
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${type.color}20`,
                      background: `linear-gradient(135deg, ${type.color}15 0%, ${type.color}05 100%)`,
                      borderColor: `${type.color}30`,
                      '& .icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        color: type.color
                      },
                      '& .title': {
                        color: type.color
                      }
                    }
                  }}
                  onClick={() => navigate(type.path)}
                >
                  <Box sx={{ 
                    position: 'relative',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <IconComponent 
                      className="icon"
                      sx={{ 
                        fontSize: 48, 
                        mb: 2,
                        color: `${type.color}99`,
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <Typography 
                      className="title"
                      variant="h6" 
                      sx={{ 
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 1,
                        color: '#1C243A',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {type.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {type.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default InspectionHome; 