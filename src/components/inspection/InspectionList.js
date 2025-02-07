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
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);

  // 현재 로그인한 사용자 정보 조회
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          fetchInspections(userData); // 사용자 정보를 가지고 점검 목록 조회
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchInspections = async (user) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('토큰이 없습니다. 로그인이 필요합니다.');
        return;
      }

      // USER 권한일 경우 회사별 API 사용, 그 외는 전체 조회 API 사용
      const url = user?.role === 'USER' && user?.companyId
        ? `http://localhost:8080/api/inspections/company/${user.companyId}`
        : 'http://localhost:8080/api/inspections';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 페이징 데이터 처리
        const inspectionsArray = data.content || [];
        setInspections(inspectionsArray);
        setFilteredInspections(inspectionsArray);
        setTotalPages(data.totalPages);
      } else {
        console.error('API 호출 실패:', response.status);
      }
    } catch (error) {
      console.error('점검 목록 로딩 실패:', error);
      setInspections([]);
      setFilteredInspections([]);
    }
  };

  const getCurrentPageData = () => {
    if (!Array.isArray(filteredInspections)) {
      return [];
    }
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInspections.slice(startIndex, endIndex);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleInspectionClick = (inspectionId) => {
    navigate(`/inspection/${inspectionId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
        <Typography variant="h6">점검 목록</Typography>
      </Box>

      <Box sx={{ mt: 6 }}>
        {/* 검색창 */}
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="담당자명 검색"
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
                <TableCell sx={{ 
                  py: 1, 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  width: '15%'
                }}>
                  No.
                </TableCell>
                <TableCell sx={{ 
                  py: 1, 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  width: '25%'
                }}>
                  업체명
                </TableCell>
                <TableCell sx={{ 
                  py: 1, 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  width: '25%'
                }}>
                  담당자
                </TableCell>
                <TableCell sx={{ 
                  py: 1, 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  width: '35%'
                }}>
                  점검일자
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPageData().map((inspection, index) => (
                <TableRow 
                  key={inspection.inspectionId}
                  onClick={() => handleInspectionClick(inspection.inspectionId)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>
                    {inspection.inspectionId}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inspection.companyName}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inspection.managerName}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>
                    {formatDate(inspection.inspectionDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
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

export default InspectionList; 