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
  Button,
  InputAdornment,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Grid,
  Stack,
  Pagination,
  Snackbar,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import NoticeDialog from './NoticeDialog';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    popup: false,
    popupStartDate: null,
    popupEndDate: null,
    images: []
  });
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    content: false
  });

  // 초기 상태 상수로 정의
  const initialNoticeState = {
    title: '',
    content: '',
    popup: false,
    popupStartDate: null,
    popupEndDate: null,
    images: []
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    const filtered = notices.filter(notice =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotices(filtered);
    setPage(1);
  }, [searchTerm, notices]);

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
        setFilteredNotices(data);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    // 유효성 검사 추가
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      setFormErrors({
        title: !newNotice.title.trim(),
        content: !newNotice.content.trim()
      });
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newNotice.title);
      formData.append('content', newNotice.content);
      formData.append('userId', localStorage.getItem('userId'));
      formData.append('popup', newNotice.popup);
      if (newNotice.popup) {
        formData.append('popupStartDate', newNotice.popupStartDate.toISOString());
        formData.append('popupEndDate', newNotice.popupEndDate.toISOString());
      }
      if (newNotice.images) {
        newNotice.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await fetch('http://localhost:8080/api/notices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 응답:', errorData);
        throw new Error(errorData.message || '공지사항 등록에 실패했습니다.');
      }

      setSnackbar({
        open: true,
        message: '공지사항이 성공적으로 등록되었습니다.',
        severity: 'success'
      });

      fetchNotices();
      setDialogOpen(false);
      setNewNotice(initialNoticeState); // 입력 필드 초기화
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      setSnackbar({
        open: true,
        message: error.message || '공지사항 등록에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/notices/${noticeId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchNotices();
        }
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // 현재 페이지의 데이터만 반환하는 함수 추가
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredNotices.slice(startIndex, endIndex);
  };

  const handleRowClick = async (noticeId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notices/${noticeId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedNotice(data);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error);
    }
  };

  const handleAddNoticeClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({
        open: true,
        message: '로그인 후 이용해 주세요.',
        severity: 'warning'
      });
      
      // 커스텀 이벤트를 발생시켜 로그인 다이얼로그를 표시
      const event = new CustomEvent('openLoginDialog');
      window.dispatchEvent(event);
      return;
    }
    setDialogOpen(true);
  };

  // 다이얼로그 닫기 핸들러
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewNotice(initialNoticeState); // 입력 필드 초기화
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setPage(value);
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
        <Typography variant="h6">공지사항</Typography>
      </Box>

      <Box sx={{ mt: 6 }}>
        {/* 검색창 */}
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="제목 검색"
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

        {/* 공지사항 목록 테이블 */}
        <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 'none' }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell 
                  sx={{ 
                    py: 1, 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold',
                    width: '30%'
                  }}
                >
                  제목
                </TableCell>
                <TableCell 
                  sx={{ 
                    py: 1, 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold',
                    width: '25%'
                  }}
                >
                  작성자
                </TableCell>
                <TableCell 
                  sx={{ 
                    py: 1, 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold',
                    width: '25%'
                  }}
                >
                  작성일
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    py: 1, 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold',
                    width: '15%'
                  }}
                >
                  상태
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPageData().map((notice, index) => (
                <TableRow 
                  key={notice.noticeId}
                  onClick={() => handleRowClick(notice.noticeId)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notice.title}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notice.writerName}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {formatDate(notice.createdAt)}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: notice.popup ? 'primary.main' : 'error.main',
                        bgcolor: notice.popup ? 'primary.lighter' : 'error.lighter',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {notice.popup ? '팝업' : '일반'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 공지사항 추가 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNoticeClick}
            sx={{
              bgcolor: '#1C243A',
              '&:hover': {
                bgcolor: '#3d63b8'
              }
            }}
          >
            공지사항 등록
          </Button>
        </Box>

        {/* 페이지네이션 */}
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={Math.ceil(filteredNotices.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Stack>
      </Box>

      {/* 공지사항 등록 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>공지사항 등록</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={newNotice.title}
                onChange={(e) => {
                  setNewNotice({...newNotice, title: e.target.value});
                  setFormErrors(prev => ({...prev, title: false}));
                }}
                error={formErrors.title}
                helperText={formErrors.title ? "제목을 입력해주세요" : ""}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="내용"
                multiline
                rows={4}
                value={newNotice.content}
                onChange={(e) => {
                  setNewNotice({...newNotice, content: e.target.value});
                  setFormErrors(prev => ({...prev, content: false}));
                }}
                error={formErrors.content}
                helperText={formErrors.content ? "내용을 입력해주세요" : ""}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="image-upload"
                onChange={(e) => setNewNotice({
                  ...newNotice, 
                  images: [...newNotice.images, ...Array.from(e.target.files)]
                })}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                >
                  이미지 선택
                </Button>
              </label>
              {newNotice.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                    선택된 파일: {newNotice.images.length}개
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {newNotice.images.map((image, index) => (
                      <Box
                        key={index}
                        sx={{ 
                          position: 'relative',
                          width: 100,
                          height: 100,
                          border: '1px solid #eee',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`미리보기 ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.9)'
                            }
                          }}
                          onClick={() => {
                            const newImages = [...newNotice.images];
                            newImages.splice(index, 1);
                            setNewNotice({...newNotice, images: newImages});
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newNotice.popup}
                    onChange={(e) => setNewNotice({...newNotice, popup: e.target.checked})}
                  />
                }
                label="팝업 공지"
              />
            </Grid>
            {newNotice.popup && (
              <>
                <Grid item xs={6}>
                  <DateTimePicker
                    label="팝업 시작일시"
                    value={newNotice.popupStartDate}
                    onChange={(date) => setNewNotice({...newNotice, popupStartDate: date})}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateTimePicker
                    label="팝업 종료일시"
                    value={newNotice.popupEndDate}
                    onChange={(date) => setNewNotice({...newNotice, popupEndDate: date})}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">등록</Button>
        </DialogActions>
      </Dialog>

      {/* 공지사항 상세 보기 다이얼로그 */}
      <NoticeDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        notice={selectedNotice}
        onDelete={() => {
          setDetailOpen(false);
          fetchNotices();
        }}
        onUpdate={() => {
          setDetailOpen(false);
          fetchNotices();
        }}
      />

      {/* Snackbar 추가 */}
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
    </Box>
  );
};

export default NoticeList; 