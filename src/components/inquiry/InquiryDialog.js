import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Modal,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { styled } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import BuildIcon from '@mui/icons-material/Build';

// 스타일링된 컴포넌트
const InquirySection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef'
}));

const ResponseSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#fff',
  border: '1px solid #4caf50',
  borderLeft: '4px solid #4caf50'
}));

const InquiryDialog = ({ open, onClose, inquiry, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInquiry, setEditedInquiry] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newInquiry, setNewInquiry] = useState({
    inquiryTitle: '',
    inquiryContent: '',
    contactNumber: '',
    images: []
  });
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const isAuthor = inquiry?.writerId === currentUserId;
  const isAdmin = localStorage.getItem('role')?.toUpperCase() === 'ADMIN';
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditClick = () => {
    setEditedInquiry({
      ...inquiry,
      existingImages: inquiry.imageUrls || [],
      processed: Boolean(inquiry.processed),
      processContent: inquiry.processContent || '',
      memo: inquiry.memo || ''
    });
    setNewImages([]);
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    setNewImages([...newImages, ...Array.from(e.target.files)]);
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    const updatedImages = editedInquiry.existingImages.filter((_, index) => index !== indexToRemove);
    setEditedInquiry({
      ...editedInquiry,
      existingImages: updatedImages
    });
    
    // 마지막 이미지를 삭제하는 경우에도 빈 배열을 유지
    if (updatedImages.length === 0) {
      // console.log('마지막 이미지 삭제');
    }
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages(newImages.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('inquiryTitle', editedInquiry.inquiryTitle);
      formData.append('inquiryContent', editedInquiry.inquiryContent);
      formData.append('contactNumber', editedInquiry.contactNumber);

      // 기존 이미지 처리 - 빈 배열일 때도 명시적으로 전송
      if (Array.isArray(editedInquiry.existingImages)) {  // 배열인지 확인
        if (editedInquiry.existingImages.length > 0) {
          editedInquiry.existingImages.forEach(url => {
            formData.append('existingImages', url);
          });
        } else {
          // 빈 배열일 때 빈 문자열을 보내서 모든 이미지 삭제 표시
          formData.append('existingImages', '');
        }
      }

      // 새 이미지 처리
      if (newImages && newImages.length > 0) {
        newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      // ADMIN만 처리상태 관련 필드 수정 가능
      if (isAdmin) {
        // processed가 undefined일 경우 기본값 false 설정
        const processedValue = editedInquiry.processed !== undefined ? editedInquiry.processed : false;
        formData.append('processed', processedValue.toString());
        
        if (editedInquiry.processContent) {
          formData.append('processContent', editedInquiry.processContent);
        }
        if (editedInquiry.memo) {
          formData.append('memo', editedInquiry.memo);
        }
      }

      // 요청 데이터 확인을 위한 로그
      // console.log('Update Request Data:');
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ': ' + pair[1]);
      // }
      // console.log('Is Admin:', isAdmin);
      // console.log('Edited Inquiry:', editedInquiry);

      const response = await fetch(`http://localhost:8080/api/inquiries/${inquiry.inquiryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();  // 에러 응답 내용 확인
        console.error('Server Error:', errorData);
        throw new Error(errorData.message || '문의사항 수정에 실패했습니다.');
      }

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('문의사항 수정 실패:', error);
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/inquiries/${inquiry.inquiryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('문의사항 삭제에 실패했습니다.');
        }

        onClose();
        if (onDelete) onDelete();
      } catch (error) {
        console.error('문의사항 삭제 실패:', error);
        alert(error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // 등록 모드 핸들러
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('inquiryTitle', newInquiry.inquiryTitle);
      formData.append('inquiryContent', newInquiry.inquiryContent);
      formData.append('contactNumber', newInquiry.contactNumber);
      formData.append('userId', localStorage.getItem('userId'));

      newInquiry.images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch('http://localhost:8080/api/inquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('문의사항 등록에 실패했습니다.');
      }

      onClose();
    } catch (error) {
      console.error('문의사항 등록 실패:', error);
      alert(error.message);
    }
  };

  // 등록 모드일 때의 이미지 처리
  const handleCreateImageChange = (e) => {
    setNewInquiry({
      ...newInquiry,
      images: Array.from(e.target.files)
    });
  };

  const handleRemoveCreateImage = (indexToRemove) => {
    setNewInquiry({
      ...newInquiry,
      images: newInquiry.images.filter((_, index) => index !== indexToRemove)
    });
  };

  // 처리 버튼 클릭 핸들러
  const handleProcessClick = () => {
    setIsProcessing(true);
    setEditedInquiry({
      ...inquiry,
      processed: Boolean(inquiry.processed),
      processContent: inquiry.processContent || '',
      memo: inquiry.memo || ''
    });
  };

  // 등록 모드 UI
  if (!inquiry) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">문의사항 등록</Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={newInquiry.inquiryTitle}
                onChange={(e) => setNewInquiry({
                  ...newInquiry,
                  inquiryTitle: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="문의내용"
                value={newInquiry.inquiryContent}
                onChange={(e) => setNewInquiry({
                  ...newInquiry,
                  inquiryContent: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="연락처"
                value={newInquiry.contactNumber}
                onChange={(e) => setNewInquiry({
                  ...newInquiry,
                  contactNumber: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="inquiry-create-image"
                onChange={handleCreateImageChange}
              />
              <label htmlFor="inquiry-create-image">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                >
                  이미지 추가
                </Button>
              </label>

              {/* 선택된 이미지 미리보기 */}
              {newInquiry.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    선택된 이미지 ({newInquiry.images.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {newInquiry.images.map((image, index) => (
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
                          alt={`이미지 ${index + 1}`}
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
                          onClick={() => handleRemoveCreateImage(index)}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!newInquiry.inquiryTitle || !newInquiry.inquiryContent}
          >
            등록
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          {/* 수정 모드가 아닐 때만 제목 표시 */}
          {!isEditing ? (
            <Typography variant="h6">{inquiry?.inquiryTitle}</Typography>
          ) : (
            <Typography variant="h6">문의사항 수정</Typography>
          )}
          
          {/* 작성자나 관리자만 수정/삭제 버튼 표시 */}
          {(isAuthor || isAdmin) && !isEditing && (
            <Box>
              <IconButton onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </DialogTitle>

        <DialogContent>
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  label="제목"
                  value={editedInquiry.inquiryTitle}
                  onChange={(e) => setEditedInquiry({...editedInquiry, inquiryTitle: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="문의내용"
                  value={editedInquiry.inquiryContent}
                  onChange={(e) => setEditedInquiry({...editedInquiry, inquiryContent: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="연락처"
                  value={editedInquiry.contactNumber}
                  onChange={(e) => setEditedInquiry({...editedInquiry, contactNumber: e.target.value})}
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  id="inquiry-image-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="inquiry-image-upload">
                  <Button variant="outlined" component="span" size="small">
                    이미지 추가
                  </Button>
                </label>

                {/* 기존 이미지 표시 */}
                {editedInquiry.existingImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      기존 이미지 ({editedInquiry.existingImages.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {editedInquiry.existingImages.map((url, index) => (
                        <Box
                          key={`existing-${index}`}
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
                            src={`http://localhost:8080/uploads/inquiry_images/${url}`}
                            alt={`기존 이미지 ${index + 1}`}
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
                            onClick={() => handleRemoveExistingImage(index)}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 새로 추가된 이미지 표시 */}
                {newImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      새로 추가된 이미지 ({newImages.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {newImages.map((image, index) => (
                        <Box
                          key={`new-${index}`}
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
                            alt={`새 이미지 ${index + 1}`}
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
                            onClick={() => handleRemoveNewImage(index)}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* ADMIN 전용 필드들 */}
              {isAdmin && (
                <>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(editedInquiry.processed)}
                          onChange={(e) => setEditedInquiry({
                            ...editedInquiry,
                            processed: e.target.checked
                          })}
                        />
                      }
                      label={editedInquiry.processed ? "처리완료" : "미처리"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="처리내용"
                      value={editedInquiry.processContent || ''}
                      onChange={(e) => setEditedInquiry({
                        ...editedInquiry,
                        processContent: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="메모"
                      value={editedInquiry.memo || ''}
                      onChange={(e) => setEditedInquiry({
                        ...editedInquiry,
                        memo: e.target.value
                      })}
                    />
                  </Grid>
                </>
              )}

              
            </Grid>
          ) : (
            <>
              <Box sx={{ mb: 2, color: 'grey.600' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  작성자: {inquiry.writerName} ({inquiry.companyName})
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  연락처: {inquiry.contactNumber}
                </Typography>
                <Typography variant="body2">
                  작성일: {formatDate(inquiry.createdAt)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1.5,
                  color: 'text.secondary',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <span>문의내용</span>
              </Typography>
              <Paper elevation={0} sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 1
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {inquiry.inquiryContent}
                </Typography>
              </Paper>

              {inquiry.imageUrls && inquiry.imageUrls.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    첨부파일 ({inquiry.imageUrls.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    {inquiry.imageUrls.map((url, index) => (
                      <Box 
                        key={index}
                        component="img"
                        src={`http://localhost:8080/uploads/inquiry_images/${url}`}
                        alt={`첨부이미지 ${index + 1}`}
                        sx={{ 
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => {
                          setSelectedImage(url);
                          setImageModalOpen(true);
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em'
                }} gutterBottom>
                  처리상태: {inquiry.processed ? "처리완료" : "미처리"}
                </Typography>
                {inquiry.processed && (
                  <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1 }}>
                    {inquiry.processContent && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          처리내용
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {inquiry.processContent}
                        </Typography>
                      </>
                    )}
                    {inquiry.memo && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          메모
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {inquiry.memo}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>취소</Button>
              <Button onClick={handleUpdate} variant="contained">수정</Button>
            </>
          ) : (
            <Button onClick={onClose}>닫기</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 이미지 확대 모달 */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          component="img"
          src={`http://localhost:8080/uploads/inquiry_images/${selectedImage}`}
          alt="선택된 이미지"
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1
          }}
          onClick={() => setImageModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default InquiryDialog; 