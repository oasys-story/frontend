import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: '',
    username: '',
    fullName: '',
    role: 'USER',
    email: '',
    phoneNumber: '',
    companyName: '',
    active: true
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/companies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      }
    };

    if (userId) {
      fetchUserData();
    }

    fetchCompanies();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const selectedCompany = companies.find(c => c.companyName === user.companyName);
      
      const updateData = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        companyId: selectedCompany ? selectedCompany.companyId : null,
        active: user.active
      };

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('사용자 정보가 수정되었습니다.');
      } else {
        alert('사용자 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('사용자 정보 수정 중 오류가 발생했습니다.');
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
        <Typography variant="h6">사용자 상세</Typography>
      </Box>

      <Paper sx={{ p: 2, mt: 6 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* ID - 수정 불가능 표시 */}
            <TextField
              label="ID"
              value={user.username}
              fullWidth
              disabled
              InputProps={{
                sx: { bgcolor: '#f5f5f5' }
              }}
            />
            
            {/* 이름 */}
            <TextField
              label="이름"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              fullWidth
              size="small"
              required
            />
            
            {/* 업체 */}
            <FormControl fullWidth size="small">
              <InputLabel>업체</InputLabel>
              <Select
                value={user.companyName || ''}
                onChange={(e) => setUser({ ...user, companyName: e.target.value })}
                label="업체"
              >
                {companies.map((company) => (
                  <MenuItem key={company.companyId} value={company.companyName}>
                    {company.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* 권한 */}
            <FormControl fullWidth size="small">
              <InputLabel>권한</InputLabel>
              <Select
                value={user.role || ''}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                label="권한"
              >
                <MenuItem value="ADMIN">관리자</MenuItem>
                <MenuItem value="MANAGER">업체담당자</MenuItem>
              </Select>
            </FormControl>
            
            {/* 이메일 */}
            <TextField
              label="이메일"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              fullWidth
              size="small"
            />
            
            {/* 연락처 */}
            <TextField
              label="연락처"
              value={user.phoneNumber}
              onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
              fullWidth
              size="small"
            />

            {/* 사용여부 */}
            <FormControlLabel
              control={
                <Switch
                  checked={user.active}
                  onChange={(e) => setUser({ ...user, active: e.target.checked })}
                  color={user.active ? "success" : "default"}
                />
              }
              label={user.active ? "사용" : "미사용"}
              sx={{ mt: 1 }}
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
                onClick={() => navigate('/users')}
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
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default UserManagement; 