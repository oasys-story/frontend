import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

const InspectionHome = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ height: '100vh' }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'transparent'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}
          >
            <ElectricBoltIcon 
              sx={{ 
                fontSize: 80, 
                color: '#1C243A',
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
              }} 
            />
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1C243A',
                  mb: 2,
                  letterSpacing: '-0.5px'
                }}
              >
                전기설비 점검
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem'
                }}
              >
                안전한 전기설비 점검을 시작해보세요
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/inspection/safety')}
              sx={{
                backgroundColor: '#1C243A',
                '&:hover': {
                  backgroundColor: '#2A3652'
                },
                width: '100%',
                py: 2,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(28, 36, 58, 0.15)'
              }}
            >
              점검 시작하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InspectionHome; 