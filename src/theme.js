import { createTheme } from '@mui/material/styles';

/* 테마 생성 Material UI 컴포넌트 스타일 적용*/
const theme = createTheme({
  palette: {
    /* 색상 적용*/
    primary: {
      main: '#1C243A',
    },
    text: {
      primary: '#2A2A2A',
      secondary: '#666666',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    /* 폰트 적용*/
    fontFamily: 'Pretendard, sans-serif',
    h6: {
      color: '#2A2A2A',
      fontWeight: 600,
    },
    body1: {
      color: '#2A2A2A',
    },
    button: {
      fontWeight: 500,
    },
  },
  components: {
    /* 버튼 스타일 적용*/
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#1C243A',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#3a5bbf',
          },
        },
      },
    },
    /* 텍스트 필드 스타일 적용*/
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label': {
            color: '#2A2A2A',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#1C243A',
            },
            '&:hover fieldset': {
              borderColor: '#3a5bbf',
            },
          },
        },
      },
    },
  },
});

export default theme; 