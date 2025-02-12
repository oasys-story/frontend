import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const CompanyManagement = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState({
    companyId: '',
    companyName: '',
    phoneNumber: '',
    faxNumber: '',
    notes: '',
    businessNumber: '',
    contractDate: null,
    startDate: null,
    expiryDate: null,
    monthlyFee: '',
    status: 'ACTIVE',
    address: '',
    detailAddress: ''
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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
      const formattedData = {
        ...company,
        contractDate: company.contractDate instanceof Date 
          ? company.contractDate.toISOString().split('T')[0] 
          : company.contractDate,
        startDate: company.startDate instanceof Date 
          ? company.startDate.toISOString().split('T')[0] 
          : company.startDate,
        expiryDate: company.expiryDate instanceof Date 
          ? company.expiryDate.toISOString().split('T')[0] 
          : company.expiryDate,
        terminationDate: company.terminationDate instanceof Date 
          ? company.terminationDate.toISOString().split('T')[0] 
          : company.terminationDate,
        monthlyFee: company.monthlyFee ? parseFloat(company.monthlyFee) : null,
        status: company.status
      };

      const formData = new FormData();
      formData.append('company', JSON.stringify(formattedData));

      const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompany(updatedCompany);
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
  const isAdmin = sessionStorage.getItem('role')?.toUpperCase() === 'ADMIN';

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
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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

  // 주소 검색 핸들러 추가
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        // 도로명 주소 또는 지번 주소
        const address = data.roadAddress || data.jibunAddress;
        
        setCompany(prev => ({
          ...prev,
          address: address,
        }));
      }
    }).open();
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
              label="사업자 번호"
              value={company.businessNumber || ''}
              onChange={(e) => setCompany({ ...company, businessNumber: e.target.value })}
              fullWidth
              size="small"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="계약일자"
                value={company.contractDate ? new Date(company.contractDate) : null}
                onChange={(date) => setCompany({ ...company, contractDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />

              <DatePicker
                label="시작일자"
                value={company.startDate ? new Date(company.startDate) : null}
                onChange={(date) => setCompany({ ...company, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />

              <DatePicker
                label="만기일자"
                value={company.expiryDate ? new Date(company.expiryDate) : null}
                onChange={(date) => setCompany({ ...company, expiryDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </LocalizationProvider>

            <TextField
              label="월 비용"
              value={company.monthlyFee || ''}
              onChange={(e) => setCompany({ ...company, monthlyFee: e.target.value })}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₩</InputAdornment>,
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>상태</InputLabel>
              <Select
                name="status"
                value={company.status}
                onChange={(e) => setCompany({ ...company, status: e.target.value })}
                label="상태"
              >
                <MenuItem value="ACTIVE">사용</MenuItem>
                <MenuItem value="TERMINATED">해지</MenuItem>
              </Select>
            </FormControl>

            {company.status === 'TERMINATED' && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="해지일자"
                  value={company.terminationDate ? new Date(company.terminationDate) : null}
                  onChange={(date) => setCompany({ ...company, terminationDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="주소"
                value={company.address || ''}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddressSearch}
                sx={{ 
                  minWidth: 'auto',
                  color: '#1C243A',
                  borderColor: '#1C243A',
                  '&:hover': {
                    borderColor: '#3d63b8',
                    color: '#3d63b8'
                  }
                }}
              >
                검색
              </Button>
            </Box>

            {/* <TextField
              label="상세주소"
              value={company.detailAddress || ''}
              onChange={(e) => setCompany({ ...company, detailAddress: e.target.value })}
              fullWidth
              size="small"
            /> */}

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
              {/* {isAdmin && (
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
              )} */}
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CompanyManagement; 