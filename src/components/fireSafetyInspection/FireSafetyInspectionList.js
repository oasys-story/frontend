import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Typography,
  Pagination,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const FireSafetyInspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserAndInspections = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const userResponse = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
  
          const inspectionsResponse = await fetch('http://localhost:8080/api/fire-inspections', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (inspectionsResponse.ok) {
            let inspectionsData = await inspectionsResponse.json();
            
            // 사용자 권한이 USER이면 본인의 회사 점검만 필터링
            let filteredInspections = userData.role === 'USER'
              ? inspectionsData.filter(inspection => inspection.companyId === userData.companyId)
              : inspectionsData;
            
            // fireInspectionId 기준 내림차순 정렬 (최신 점검이 앞에 오도록)
            filteredInspections.sort((a, b) => b.fireInspectionId - a.fireInspectionId);
  
            setInspections(filteredInspections);
            setFilteredInspections(filteredInspections);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    fetchUserAndInspections();
  }, []);
  

  useEffect(() => {
    let filtered = inspections;
    if (searchTerm) {
      filtered = inspections.filter(inspection =>
        inspection.buildingName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredInspections(filtered);
    setPage(1);
  }, [searchTerm, inspections]);

  const getCurrentPageData = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInspections.slice(startIndex, endIndex);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <Box sx={{ pl: 2, pr: 2, pb: 2, maxWidth: '430px', margin: '0 auto' }}>
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
        <Typography variant="h6">소방점검 목록</Typography>
      </Box>

      <Box sx={{ mt: 6 }}>
        {/* 검색창 */}
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="건물명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* 점검 목록 테이블 */}
        <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 'none' }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ py: 1, fontSize: '0.875rem', fontWeight: 'bold', width: '15%' }}>
                  No.
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: '0.875rem', fontWeight: 'bold', width: '25%' }}>
                  건물명
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: '0.875rem', fontWeight: 'bold', width: '25%' }}>
                  점검업체
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: '0.875rem', fontWeight: 'bold', width: '35%' }}>
                  점검일자
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPageData().map((inspection, index) => (
                <TableRow 
                  key={inspection.fireInspectionId}
                  onClick={() => navigate(`/fire-safety-inspection/${inspection.fireInspectionId}`)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  {/* 최신순을 유지하면서 연속된 번호 부여 */}
                  <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>
                    {filteredInspections.length - ((page - 1) * itemsPerPage + index)}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inspection.buildingName}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{inspection.companyName}</TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{formatDate(inspection.inspectionDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>


          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={Math.ceil(filteredInspections.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default FireSafetyInspectionList; 