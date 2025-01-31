import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const CompanyManagement = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState({
    companyId: '',
    companyName: '',
    phoneNumber: '',
    faxNumber: '',
    notes: '',
    active: true
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(company)
      });

      if (response.ok) {
        alert('업체 정보가 수정되었습니다.');
      } else {
        alert('업체 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update company:', error);
      alert('업체 정보 수정 중 오류가 발생했습니다.');
    }
  };

  // ADMIN 권한 체크
  const isAdmin = localStorage.getItem('role')?.toUpperCase() === 'ADMIN';

  // 업체 삭제 핸들러
  const handleDelete = async () => {
    if (!isAdmin) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('업체가 성공적으로 삭제되었습니다.');
          navigate('/companies'); // 목록으로 이동
        } else {
          throw new Error('삭제 실패');
        }
      } catch (error) {
        console.error('Failed to delete company:', error);
        alert('업체 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '430px', margin: '0 auto' }}>
      {/* 헤더 */}
      <Box sx={{ 
        position: 'sticky',   
        top: 0, 
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #eee',
        zIndex: 1,
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6">업체 상세</Typography>
      </Box>

      <Paper sx={{ p: 2, mt: 6 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="업체명"
              value={company.companyName}
              onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
              fullWidth
              size="small"
              required
            />
            
            <TextField
              label="연락처"
              value={company.phoneNumber || ''}
              onChange={(e) => setCompany({ ...company, phoneNumber: e.target.value })}
              fullWidth
              size="small"
            />

            <TextField
              label="팩스번호"
              value={company.faxNumber || ''}
              onChange={(e) => setCompany({ ...company, faxNumber: e.target.value })}
              fullWidth
              size="small"
            />

            <TextField
              label="비고"
              value={company.notes || ''}
              onChange={(e) => setCompany({ ...company, notes: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={company.active}
                  onChange={(e) => setCompany({ ...company, active: e.target.checked })}
                  color={company.active ? "success" : "default"}
                />
              }
              label={company.active ? "사용" : "미사용"}
            />

            {/* 버튼 그룹 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'center',
              mt: 2 
            }}>
              <Button 
                variant="contained"
                type="submit"
                sx={{ 
                  minWidth: '100px',
                  bgcolor: '#1C243A',
                  '&:hover': { bgcolor: '#3d63b8' }
                }}
              >
                저장
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/companies')}
                sx={{ 
                  minWidth: '100px',
                  color: '#1C243A',
                  borderColor: '#1C243A',
                  '&:hover': {
                    borderColor: '#3d63b8',
                    color: '#3d63b8'
                  }
                }}
              >
                목록
              </Button>
              {isAdmin && (
                <Button 
                  variant="outlined"
                  onClick={handleDelete}
                  sx={{ 
                    minWidth: '100px',
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      borderColor: 'error.dark',
                      color: 'white'
                    }
                  }}
                >
                  삭제
                </Button>
              )}
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CompanyManagement; 