import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress } from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';

/* 서명 컴포넌트 */
const SignatureDialog = ({ open, onClose, onConfirm }) => {
  let sigPad = {};  // 서명 패드 참조 저장
  const [isSaving, setIsSaving] = useState(false);  // 저장 중 상태 추가

  const handleClear = () => {
    sigPad.clear(); // 서명 패드 초기화
  };

  const handleSave = async () => {
    if (!sigPad.isEmpty()) {
      setIsSaving(true);  // 저장 시작
      try {
        const signatureData = sigPad.toDataURL();
        await onConfirm(signatureData);  // 비동기 처리 대기
      } finally {
        setIsSaving(false);  // 저장 완료
      }
    }
  };

  // 저장 중일 때 닫기 방지
  const handleClose = (event, reason) => {
    if (isSaving) return; // 저장 중에는 닫기 방지
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}  // 수정된 부분
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isSaving}
    >
      <DialogTitle>서명해 주세요</DialogTitle>
      <DialogContent>
        <Box sx={{ border: '1px solid #ccc', mt: 2 }}>
          <SignatureCanvas
            ref={(ref) => { sigPad = ref }} // 서명 패드 참조 설정
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas'
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClear}
          disabled={isSaving}  // 저장 중 비활성화
        >
          지우기
        </Button>
        <Button 
          onClick={handleClose}  // handleClose 사용
          disabled={isSaving}  // 저장 중 비활성화
        >
          취소
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={isSaving}  // 저장 중 비활성화
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? '저장 중...' : '확인'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog; 