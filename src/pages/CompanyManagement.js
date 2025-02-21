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
  MenuItem,
  Grid,
  IconButton,
  Chip,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const structureOptions = ["콘크리트 구조", "철골구조", "조적조", "목구조", "기타"];
const roofOptions = ["슬래브", "기와", "슬레이트", "기타"];

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
    detailAddress: '',
    businessLicenseImage: null,
    parkingLot: '',
    indoorParkingDetail: '',
    buildingStructure: '',
    roofStructure: '',
    stairsType: '',
    stairsCount: '',
    elevatorType: '',
    elevatorCount: '',
    ramp: '',
    floorType: '',
    floorCount: '',
    exteriorImage: '',
    entranceImage: '',
    mainPanelImage: '',
    etcImage1: '',
    etcImage2: '',
    etcImage3: '',
    etcImage4: ''
  });
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', phone: '' });

  // fetchEmployees 함수를 컴포넌트 레벨로 이동
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${companyId}/employees`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // active 상태와 관계없이 모든 직원 정보 저장
        setEmployees(data);
      }
    } catch (error) {
      console.error('직원 정보 조회 실패:', error);
    }
  };

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
          
          // parkingLot과 floorCount 파싱을 위한 임시 객체
          let parsedData = { ...data };

          // parkingLot 데이터 파싱
          if (data.parkingLot) {
            const [mainType, ...details] = data.parkingLot.split('/');
            parsedData = {
              ...parsedData,
              parkingLot: mainType.trim(),
              indoorParkingDetail: details.join(' / ').trim()
            };
          }

          // floorCount 파싱 (예: "지상 2층" -> floorType: "지상", floorCount: "2")
          if (data.floorCount) {
            const matches = data.floorCount.match(/(지상|지하)\s*(\d+)층/);
            if (matches) {
              parsedData = {
                ...parsedData,
                floorType: matches[1],
                floorCount: matches[2]
              };
            }
          }

          setCompany(parsedData);
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      }
    };

    if (companyId) {
      fetchCompanyData();
      fetchEmployees();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submittingData = {
        ...company,
        parkingLot: company.parkingLot === '옥내' && company.indoorParkingDetail
          ? `${company.parkingLot}/${company.indoorParkingDetail}`
          : company.parkingLot,
        floorCount: company.floorType && company.floorCount 
          ? `${company.floorType} ${company.floorCount}층`
          : null
      };

      const formattedData = {
        ...submittingData,
        contractDate: submittingData.contractDate instanceof Date 
          ? submittingData.contractDate.toISOString().split('T')[0] 
          : submittingData.contractDate,
        startDate: submittingData.startDate instanceof Date 
          ? submittingData.startDate.toISOString().split('T')[0] 
          : submittingData.startDate,
        expiryDate: submittingData.expiryDate instanceof Date 
          ? submittingData.expiryDate.toISOString().split('T')[0] 
          : submittingData.expiryDate,
        terminationDate: submittingData.terminationDate instanceof Date 
          ? submittingData.terminationDate.toISOString().split('T')[0] 
          : submittingData.terminationDate,
        monthlyFee: submittingData.monthlyFee ? parseFloat(submittingData.monthlyFee) : null,
        status: submittingData.status,
        employees: employees
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
        fetchEmployees();
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

  // 기존 사업자등록증 파일 확인 함수 유지
  const handleFileView = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/companies/${companyId}/business-license`,
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        }
      );
      
      // Content-Type 확인
      const contentType = response.headers['content-type'];
      const fileName = company.businessLicenseImage.split('/').pop();
      
      // Blob 생성 시 type 지정
      const blob = new Blob([response.data], { type: contentType });
      const fileUrl = window.URL.createObjectURL(blob);
      
      if (contentType === 'application/pdf') {
        // PDF 파일인 경우
        const pdfWindow = window.open('', '_blank');
        if (pdfWindow) {
          pdfWindow.document.write(
            `<html><head><title>${fileName}</title></head>` +
            `<body style="margin:0;"><embed width="100%" height="100%" src="${fileUrl}" type="application/pdf"></body></html>`
          );
        }
      } else if (contentType.startsWith('image/')) {
        // 이미지 파일인 경우
        const imgWindow = window.open('', '_blank');
        if (imgWindow) {
          imgWindow.document.write(
            `<html><head><title>${fileName}</title></head>` +
            `<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f0f0f0;">` +
            `<img src="${fileUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;">` +
            `</body></html>`
          );
        }
      } else {
        // 다른 파일 형식은 다운로드
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // 메모리 정리
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 100);

    } catch (error) {
      console.error('파일 불러오기 실패:', error);
      alert('파일을 불러올 수 없습니다.');
    }
  };

  // 새로운 이미지 URL 생성 함수 추가
  const getImageUrl = (imageType) => {
    return `http://localhost:8080/api/companies/${companyId}/image/${imageType}`;
  };

  // 이미지 보기 버튼 클릭 핸들러 추가
  const handleImageView = (imageType) => {
    const imageUrl = getImageUrl(imageType);
    window.open(imageUrl, '_blank');
  };

  // 파일명을 적절한 길이로 자르는 함수 추가
  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    return `${name.substring(0, maxLength - extension.length - 3)}...${extension}`;
  };

  // 직원 추가
  const handleAddEmployee = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${companyId}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(newEmployee)
      });
      
      if (response.ok) {
        setNewEmployee({ name: '', phone: '' });
        fetchEmployees();
      }
    } catch (error) {
      console.error('직원 추가 실패:', error);
    }
  };

  // 직원 정보 수정 (로컬 상태만 업데이트)
  const handleEmployeeChange = (employeeId, field, value) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.employeeId === employeeId 
          ? { ...emp, [field]: value }
          : emp
      )
    );
  };

  // 직원 비활성화 (삭제 대신)
  const handleDeactivateEmployee = async (employeeId) => {
    try {
      const employee = employees.find(emp => emp.employeeId === employeeId);
      
      // 요청 URL과 데이터 로깅
      const url = `http://localhost:8080/api/companies/${companyId}/employees/${employeeId}`;
      const requestData = {
        name: employee.name,
        phone: employee.phone,
        active: false
      };
      

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      const responseText = await response.text();

      if (response.ok) {
        fetchEmployees();
      } else {
        console.error('직원 비활성화 실패: 서버 응답 오류', responseText);
      }
    } catch (error) {
      console.error('직원 비활성화 실패:', error);
    }
  };

  // 이미지 업데이트 핸들러 수정
  const handleImageUpdate = async (imageType, file) => {
    try {
      const formData = new FormData();
      formData.append('company', JSON.stringify(company));
      formData.append(imageType, file);

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
        // 이미지 캐시 방지를 위한 타임스탬프 추가
        const timestamp = new Date().getTime();
        const imageUrl = getImageUrl(imageType.replace('Image', '')) + `?t=${timestamp}`;
        // 이미지 요소 강제 새로고침
        const imgElement = document.querySelector(`img[data-image-type="${imageType}"]`);
        if (imgElement) {
          imgElement.src = imageUrl;
        }
        alert('이미지가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('이미지 업데이트 실패:', error);
      alert('이미지 업데이트에 실패했습니다.');
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '430px', margin: '0 auto', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Box sx={{ 
        mb: 4,
        textAlign: 'center',
        position: 'relative'
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 500,
          color: '#343959',
          mb: 1
        }}>
          업체 관리
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          업체 정보를 관리할 수 있습니다.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2.5
        }}>
          <TextField
            label="업체명"
            value={company.companyName || ''}
            onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#343959',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#343959',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#343959',
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="주소"
              value={company.address || ''}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8f9fa',
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  }
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={handleAddressSearch}
              sx={{ 
                minWidth: '80px',
                whiteSpace: 'nowrap',
                color: '#343959',
                borderColor: '#343959',
                borderRadius: '10px',
                '&:hover': {
                  borderColor: '#3d63b8',
                  color: '#3d63b8',
                  bgcolor: 'rgba(61, 99, 184, 0.04)'
                }
              }}
            >
              검색
            </Button>
          </Box>

          <TextField
            label="연락처"
            value={company.phoneNumber || ''}
            onChange={(e) => setCompany({ ...company, phoneNumber: e.target.value })}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#343959',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#343959',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#343959',
              }
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="사업자 번호"
                value={company.businessNumber || ''}
                onChange={(e) => setCompany({ ...company, businessNumber: e.target.value })}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#343959',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  p: 2,
                  bgcolor: '#f8f9fa',
                }}
              >
                <Typography variant="subtitle2" sx={{ 
                  color: '#343959',
                  mb: 1.5,
                  fontWeight: 500
                }}>
                  사업자등록증
                </Typography>
                {company.businessLicenseImage ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      bgcolor: 'white',
                      p: 1.5,
                      borderRadius: '10px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <ImageIcon 
                        sx={{ 
                          color: '#343959',
                          flexShrink: 0
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#666'
                        }}
                      >
                        {truncateFileName(company.businessLicenseImage.split('/').pop())}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleFileView}
                      sx={{
                        minWidth: '60px',
                        flexShrink: 0,
                        color: '#343959',
                        borderColor: '#343959',
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: '#3d63b8',
                          color: '#3d63b8',
                          bgcolor: 'rgba(61, 99, 184, 0.04)'
                        }
                      }}
                    >
                      {company.businessLicenseImage.toLowerCase().endsWith('.pdf') ? '열기' : '보기'}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    등록된 파일이 없습니다
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* 팩스번호 필드 추가 */}
          <TextField
            fullWidth
            label="팩스번호"
            value={company.faxNumber || ''}
            onChange={(e) => setCompany({ ...company, faxNumber: e.target.value })}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#343959',
                }
              }
            }}
          />

          {/* 메모 필드 추가 */}
          <TextField
            fullWidth
            label="메모"
            value={company.notes || ''}
            onChange={(e) => setCompany({ ...company, notes: e.target.value })}
            multiline
            rows={3}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#343959',
                }
              }
            }}
          />

          {/* 메모 필드 다음에 추가 */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              color: '#343959',
              mb: 2 
            }}>
              건물 정보
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="건축허가일"
                    value={company.buildingPermitDate ? new Date(company.buildingPermitDate) : null}
                    onChange={(date) => setCompany({ ...company, buildingPermitDate: date })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8f9fa',
                            borderRadius: '10px',
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#343959',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="사용승인일"
                    value={company.occupancyDate ? new Date(company.occupancyDate) : null}
                    onChange={(date) => setCompany({ ...company, occupancyDate: date })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8f9fa',
                            borderRadius: '10px',
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#343959',
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 연면적, 건축면적, 세대수 필드 추가 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="연면적"
                    value={company.totalFloorArea || ''}
                    onChange={(e) => setCompany({ ...company, totalFloorArea: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>m²</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="건축면적"
                    value={company.buildingArea || ''}
                    onChange={(e) => setCompany({ ...company, buildingArea: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>m²</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="세대수"
                    type="number"
                    value={company.numberOfUnits || ''}
                    onChange={(e) => setCompany({ ...company, numberOfUnits: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>세대</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                {/* 세대수 필드 다음에 추가 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="경사로"
                    value={company.ramp || ''}
                    onChange={(e) => setCompany({ ...company, ramp: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>개소</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="건축높이"
                    value={company.buildingHeight || ''}
                    onChange={(e) => setCompany({ ...company, buildingHeight: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>m</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="건물동수"
                    type="number"
                    value={company.numberOfBuildings || ''}
                    onChange={(e) => setCompany({ ...company, numberOfBuildings: e.target.value })}
                    size="small"
                    InputProps={{
                      endAdornment: <Typography sx={{ color: '#666' }}>동</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>주차장 유형</InputLabel>
                    <Select
                      value={company.parkingLot || ''}
                      onChange={(e) => setCompany({ ...company, parkingLot: e.target.value })}
                      sx={{
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }}
                    >
                      <MenuItem value="옥내">옥내</MenuItem>
                      <MenuItem value="옥상">옥상</MenuItem>
                      <MenuItem value="옥외">옥외</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {company.parkingLot === "옥내" && (
                  <Grid item xs={12}>
                    <Box sx={{
                      border: '1px solid #ddd',
                      borderRadius: 2,
                      p: 2,
                      bgcolor: '#f8f9fa'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                        옥내주차장 상세
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {["지하", "지상", "필로티", "기계식"].map((option) => (
                          <Chip
                            key={option}
                            label={option}
                            onClick={() => {
                              setCompany(prev => {
                                const details = prev.indoorParkingDetail?.split('/').map(s => s.trim()) || [];
                                const isSelected = details.includes(option);
                                
                                let newDetails;
                                if (isSelected) {
                                  newDetails = details.filter(d => d !== option);
                                } else {
                                  newDetails = [...details, option];
                                }
                                
                                return {
                                  ...prev,
                                  indoorParkingDetail: newDetails.filter(Boolean).join(' / ')
                                };
                              });
                            }}
                            color={company.indoorParkingDetail?.includes(option) ? "primary" : "default"}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                      건축물 구조 선택
                    </FormLabel>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        p: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <RadioGroup
                        row
                        value={company.buildingStructure || ''}
                        onChange={(e) => setCompany({ ...company, buildingStructure: e.target.value })}
                      >
                        {structureOptions.map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio sx={{ transform: "scale(0.8)" }} />}
                            label={option}
                            sx={{ ".MuiTypography-root": { fontSize: "0.85rem" } }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                      지붕구조 선택
                    </FormLabel>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        p: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <RadioGroup
                        row
                        value={company.roofStructure || ''}
                        onChange={(e) => setCompany({ ...company, roofStructure: e.target.value })}
                      >
                        {roofOptions.map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio sx={{ transform: "scale(0.8)" }} />}
                            label={option}
                            sx={{ ".MuiTypography-root": { fontSize: "0.85rem" } }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                    층수 정보
                  </FormLabel>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <TextField
                      select
                      label="유형"
                      value={company.floorType || ''}
                      onChange={(e) => setCompany({ ...company, floorType: e.target.value })}
                      size="small"
                      sx={{ width: '150px' }}
                    >
                      <MenuItem value="지상">지상</MenuItem>
                      <MenuItem value="지하">지하</MenuItem>
                    </TextField>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        label="층수"
                        value={company.floorCount || ''}
                        onChange={(e) => setCompany({ ...company, floorCount: e.target.value })}
                        size="small"
                        sx={{ width: '100px' }}
                        InputProps={{
                          inputProps: { min: 1 }
                        }}
                      />
                      <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        층
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                    계단 정보
                  </FormLabel>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <TextField
                      select
                      label="유형"
                      value={company.stairsType || ''}
                      onChange={(e) => setCompany({ ...company, stairsType: e.target.value })}
                      size="small"
                      sx={{ width: '150px' }}
                    >
                      <MenuItem value="직통(피난계단)">직통(피난계단)</MenuItem>
                      <MenuItem value="특별피난계단">특별피난계단</MenuItem>
                    </TextField>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        label="개소"
                        value={company.stairsCount || ''}
                        onChange={(e) => setCompany({ ...company, stairsCount: e.target.value })}
                        size="small"
                        sx={{ width: '100px' }}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                      <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        개
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                    승강기 정보
                  </FormLabel>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <TextField
                      select
                      label="유형"
                      value={company.elevatorType || ''}
                      onChange={(e) => setCompany({ ...company, elevatorType: e.target.value })}
                      size="small"
                      sx={{ width: '150px' }}
                    >
                      <MenuItem value="승용">승용</MenuItem>
                      <MenuItem value="비상용">비상용</MenuItem>
                      <MenuItem value="피난용">피난용</MenuItem>
                    </TextField>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        label="개수"
                        value={company.elevatorCount || ''}
                        onChange={(e) => setCompany({ ...company, elevatorCount: e.target.value })}
                        size="small"
                        sx={{ width: '100px' }}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                      <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        대
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              color: '#343959',
              mt: 1 
            }}>
              계약 정보
            </Typography>

            <DatePicker
              label="계약일자"
              value={company.contractDate ? new Date(company.contractDate) : null}
              onChange={(date) => setCompany({ ...company, contractDate: date })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8f9fa',
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#343959',
                      }
                    }
                  }}
                />
              )}
            />

            <DatePicker
              label="시작일자"
              value={company.startDate ? new Date(company.startDate) : null}
              onChange={(date) => setCompany({ ...company, startDate: date })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8f9fa',
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#343959',
                      }
                    }
                  }}
                />
              )}
            />

            <DatePicker
              label="만기일자"
              value={company.expiryDate ? new Date(company.expiryDate) : null}
              onChange={(date) => setCompany({ ...company, expiryDate: date })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8f9fa',
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#343959',
                      }
                    }
                  }}
                />
              )}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#343959',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#343959',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#343959',
              }
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>상태</InputLabel>
            <Select
              name="status"
              value={company.status}
              onChange={(e) => setCompany({ ...company, status: e.target.value })}
              label="상태"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8f9fa',
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#343959',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#343959',
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#343959',
                }
              }}
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
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8f9fa',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#343959',
                        }
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          )}

          {/* 직원 정보 섹션 */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: '#343959', mb: 2 }}>
              직원 정보
            </Typography>
            
            {/* 기존 직원 목록 */}
            {employees.filter(emp => emp.active).map((employee) => (
              <Box 
                key={employee.employeeId}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}
              >
                <TextField
                  size="small"
                  label="이름"
                  value={employee.name}
                  onChange={(e) => handleEmployeeChange(employee.employeeId, 'name', e.target.value)}
                  sx={{ 
                    width: '30%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8f9fa'
                    }
                  }}
                />
                <TextField
                  size="small"
                  label="핸드폰번호"
                  value={employee.phone}
                  onChange={(e) => handleEmployeeChange(employee.employeeId, 'phone', e.target.value)}
                  sx={{ 
                    width: '50%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8f9fa'
                    }
                  }}
                />
                <IconButton 
                  onClick={() => handleDeactivateEmployee(employee.employeeId)}
                  sx={{ 
                    color: '#666',
                    '&:hover': { color: '#ff4444' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            {/* 새 직원 추가 폼 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 2, 
              mt: 3,
              pt: 2,
              borderTop: '1px solid #eee'
            }}>
              <TextField
                size="small"
                label="이름"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                sx={{ width: '30%' }}
                error={Boolean(!newEmployee.name && newEmployee.phone)}
                helperText={!newEmployee.name && newEmployee.phone ? "이름을 입력하세요" : " "}
              />
              <TextField
                size="small"
                label="핸드폰번호"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                sx={{ width: '50%' }}
                error={Boolean(newEmployee.name && !newEmployee.phone)}
                helperText={newEmployee.name && !newEmployee.phone ? "핸드폰번호를 입력하세요" : " "}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
                disabled={!newEmployee.name || !newEmployee.phone}
                sx={{ 
                  color: '#343959',
                  borderColor: '#343959',
                  height: '40px',
                  '&:hover': {
                    borderColor: '#3d63b8',
                    color: '#3d63b8',
                    bgcolor: 'rgba(61, 99, 184, 0.04)'
                  },
                  '&.Mui-disabled': {
                    color: '#ccc',
                    borderColor: '#ccc'
                  }
                }}
              >
                추가
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              color: '#343959',
              mb: 2 
            }}>
              사진 정보
            </Typography>

            <Grid container spacing={2}>
              {[
                { type: 'exterior', key: 'exteriorImage', label: '외관 사진' },
                { type: 'entrance', key: 'entranceImage', label: '입구 사진' },
                { type: 'mainPanel', key: 'mainPanelImage', label: '메인 분전함 사진' },
                { type: 'etcImage1', key: 'etcImage1', label: '기타 사진 1' },
                { type: 'etcImage2', key: 'etcImage2', label: '기타 사진 2' },
                { type: 'etcImage3', key: 'etcImage3', label: '기타 사진 3' },
                { type: 'etcImage4', key: 'etcImage4', label: '기타 사진 4' }
              ].map((item) => (
                <Grid item xs={12} key={item.key}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#f8f9fa'
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        p: 1, 
                        bgcolor: '#343959', 
                        color: 'white',
                        textAlign: 'center'
                      }}
                    >
                      {item.label}
                    </Typography>
                    
                    <Box sx={{ p: 2 }}>
                      {company[item.key] ? (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          gap: 1 
                        }}>
                          <Box 
                            component="img"
                            src={getImageUrl(item.type)}
                            alt={item.label}
                            data-image-type={item.key}
                            sx={{
                              width: '100%',
                              maxWidth: '500px',
                              height: 'auto',
                              aspectRatio: '16/9',
                              objectFit: 'cover',
                              borderRadius: 1,
                              mb: 1
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleImageView(item.type)}
                              sx={{ 
                                bgcolor: '#343959',
                                '&:hover': { bgcolor: '#3d63b8' }
                              }}
                            >
                              크게보기
                            </Button>
                            <input
                              accept="image/*"
                              type="file"
                              id={`image-upload-${item.key}`}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpdate(item.key, e.target.files[0]);
                                }
                              }}
                            />
                            <label htmlFor={`image-upload-${item.key}`}>
                              <Button
                                size="small"
                                variant="outlined"
                                component="span"
                                sx={{ 
                                  color: '#343959',
                                  borderColor: '#343959',
                                  '&:hover': {
                                    borderColor: '#3d63b8',
                                    color: '#3d63b8'
                                  }
                                }}
                              >
                                수정
                              </Button>
                            </label>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '200px',
                          gap: 2
                        }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            등록된 사진 없음
                          </Typography>
                          <input
                            accept="image/*"
                            type="file"
                            id={`image-upload-${item.key}`}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpdate(item.key, e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor={`image-upload-${item.key}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              sx={{ 
                                color: '#343959',
                                borderColor: '#343959',
                                '&:hover': {
                                  borderColor: '#3d63b8',
                                  color: '#3d63b8'
                                }
                              }}
                            >
                              이미지 등록
                            </Button>
                          </label>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            justifyContent: 'center',
            mt: 3
          }}>
            <Button 
              variant="contained"
              type="submit"
              sx={{ 
                minWidth: '120px',
                bgcolor: '#343959',
                borderRadius: '10px',
                py: 1.5,
                '&:hover': { 
                  bgcolor: '#3d63b8'
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontWeight: 500
              }}
            >
              저장
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/companies')}
              sx={{ 
                minWidth: '120px',
                color: '#343959',
                borderColor: '#343959',
                borderRadius: '10px',
                py: 1.5,
                '&:hover': {
                  borderColor: '#3d63b8',
                  color: '#3d63b8',
                  bgcolor: 'rgba(61, 99, 184, 0.04)'
                }
              }}
            >
              목록
            </Button>
          </Box>
        </Box>
      </form>

    </Box>
  );
};

export default CompanyManagement; 