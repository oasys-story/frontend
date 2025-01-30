import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// 한글 폰트 등록
Font.register({
  family: 'Nanum Gothic',
  src: 'https://fonts.gstatic.com/ea/nanumgothic/v5/NanumGothic-Regular.ttf'
});

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Nanum Gothic'
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Nanum Gothic',
    color: '#1C243A',
    borderBottom: 2,
    borderColor: '#1C243A',
    paddingBottom: 10
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 10,
    alignItems: 'center'
  },
  topLeftSection: {
    width: '60%'
  },
  topRightSection: {
    width: '40%',
    paddingLeft: 10
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  signatureContainer: {
    alignItems: 'center'
  },
  signatureLabel: {
    fontSize: 8,
    marginBottom: 2
  },
  signatureBox: {
    border: 1,
    borderColor: '#1C243A',
    width: 100,
    height: 50,
    padding: 2,
    backgroundColor: '#f8f8f8'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    width: '25%',
    fontSize: 10,
    fontFamily: 'Nanum Gothic'
  },
  infoValue: {
    width: '75%',
    fontSize: 10,
    fontFamily: 'Nanum Gothic'
  },
  table: {
    marginTop: 0,
    border: 1,
    borderColor: '#000000',
    borderStyle: 'solid'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid'
  },
  tableHeader: {
    backgroundColor: '#1C243A',
    fontFamily: 'Nanum Gothic',
    fontSize: 10,
    padding: 5,
    color: 'white'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellWithBorder: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    textAlign: 'center'
  },
  section: {
    margin: '10 0',
    padding: 0,
    flexGrow: 1
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Nanum Gothic',
    backgroundColor: '#1C243A',
    color: 'white',
    padding: '8 15',  // 상하 8, 좌우 15
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingVertical: 5
  },
  label: {
    width: '30%',
    fontSize: 12,
    fontFamily: 'Nanum Gothic'
  },
  value: {
    width: '70%',
    fontSize: 12,
    fontFamily: 'Nanum Gothic'
  },
  measurementSection: {
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Nanum Gothic'
  },
  measurementTable: {
    marginTop: 5,
    border: 1,
    borderColor: '#000000',
    width: '100%'  // 테이블 너비를 100%로 수정
  },
  measurementRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#000000'
  },
  measurementHeaderCell: {
    width: '25%',
    padding: 5,
    fontSize: 9,
    backgroundColor: '#1C243A',
    color: 'white',
    borderRight: 1,
    borderColor: '#000000',
    textAlign: 'center'
  },
  measurementCell: {
    width: '25%',
    padding: 5,
    fontSize: 9,
    borderRight: 1,
    borderColor: '#000000',
    textAlign: 'center'
  },
  measurementLastCell: {
    width: '25%',
    padding: 5,
    fontSize: 9,
    textAlign: 'center',
    backgroundColor: '#1C243A',  // 헤더셀의 경우 배경색 추가
    color: 'white'  // 헤더셀의 경우 텍스트 색상 추가
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  image: {
    width: 150,
    height: 150,
    objectFit: 'contain'
  },
  signature: {
    width: 150,
    height: 70
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  checklistTable: {
    marginTop: 0,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    border: 1,
    borderColor: '#000000'
  },
  checklistItem: {
    width: '25%',
    padding: 8,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#1C243A',
    fontSize: 9,
    backgroundColor: '#ffffff'
  },
  checklistValue: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    color: '#1C243A',
    fontWeight: 'bold'
  },
  specialNotesSection: {
    margin: '10 0',
    padding: 15,
    backgroundColor: '#f8f8f8',
    border: 1,
    borderColor: '#1C243A',
    borderRadius: 3
  },
  imageSection: {
    margin: '10 0',
    padding: 15,
    backgroundColor: '#f8f8f8',
    border: 1,
    borderColor: '#1C243A',
    borderRadius: 3
  }
});

// PDF 문서 컴포넌트
const InspectionPDF = ({ data, checklistLabels, getStatusText }) => (
  <Document>
    {/* 첫 번째 페이지 */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>전기설비 점검 결과서</Text>

      {/* 상단 섹션 */}
      <View style={styles.topSection}>
        {/* 좌측: 기본 정보 */}
        <View style={styles.topLeftSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>업체명</Text>
            <Text style={styles.infoValue}>{data.companyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>점검일자</Text>
            <Text style={styles.infoValue}>{data.inspectionDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>점검자</Text>
            <Text style={styles.infoValue}>{data.managerName}</Text>
          </View>
        </View>

        {/* 우측: 서명란 */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>점검자</Text>
            {data.signature ? (
              <Image src={data.signature} style={styles.signatureBox} />
            ) : (
              <View style={styles.signatureBox} />
            )}
          </View>
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>관리자</Text>
            {data.managerSignature ? (
              <Image src={data.managerSignature} style={styles.signatureBox} />
            ) : (
              <View style={styles.signatureBox} />
            )}
          </View>
        </View>
      </View>

      {/* 기본사항 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>1. 기본사항</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellWithBorder}>구분</Text>
            <Text style={styles.tableCell}>수치</Text>
            <Text style={styles.tableCellWithBorder}>구분</Text>
            <Text style={styles.tableCell}>수치</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>수전전압</Text>
            <Text style={styles.tableCell}>{data.faucetVoltage}V</Text>
            <Text style={styles.tableCell}>발전전압</Text>
            <Text style={styles.tableCell}>{data.generationVoltage}V</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>수전용량</Text>
            <Text style={styles.tableCell}>{data.faucetCapacity}kW</Text>
            <Text style={styles.tableCell}>발전용량</Text>
            <Text style={styles.tableCell}>{data.generationCapacity}kW</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>태양광</Text>
            <Text style={styles.tableCell}>{data.solarCapacity}kW</Text>
            <Text style={styles.tableCell}>계약용량</Text>
            <Text style={styles.tableCell}>{data.contractCapacity}kW</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>점검종별</Text>
            <Text style={styles.tableCell}>{data.inspectionType}</Text>
            <Text style={styles.tableCell}>점검횟수</Text>
            <Text style={styles.tableCell}>{data.inspectionCount}회</Text>
          </View>
        </View>
      </View>

      {/* 점검내역 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>2. 점검내역</Text>
        <View style={styles.checklistTable}>
          {Object.entries(checklistLabels).map(([key, label]) => (
            <View style={styles.checklistItem} key={key}>
              <Text>{label}</Text>
              <Text style={styles.checklistValue}>{getStatusText(data[key])}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>

    {/* 두 번째 페이지 */}
    <Page size="A4" style={styles.page}>
      {/* 측정개소 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>3. 측정개소</Text>
        {data.measurements.map((measurement, index) => (
          <View key={index} style={styles.measurementSection}>
            <Text style={styles.subtitle}>측정개소 {measurement.measurementNumber}</Text>
            <View style={styles.measurementTable}>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementHeaderCell}>구분</Text>
                <Text style={styles.measurementHeaderCell}>전압(V)</Text>
                <Text style={styles.measurementHeaderCell}>전류(A)</Text>
                <Text style={[styles.measurementLastCell, { backgroundColor: '#1C243A', color: 'white' }]}>온도(℃)</Text>
              </View>
              {['A', 'B', 'C', 'N'].map((phase) => (
                // 데이터가 있는 경우에만 행을 렌더링
                (measurement[`voltage${phase}`] || 
                 measurement[`current${phase}`] || 
                 measurement[`temperature${phase}`]) && (
                  <View style={styles.measurementRow} key={phase}>
                    <Text style={styles.measurementCell}>{phase === 'N' ? 'N' : `${phase}-`}</Text>
                    <Text style={styles.measurementCell}>{measurement[`voltage${phase}`] || '-'}</Text>
                    <Text style={styles.measurementCell}>{measurement[`current${phase}`] || '-'}</Text>
                    <Text style={styles.measurementCell}>{measurement[`temperature${phase}`] || '-'}</Text>
                  </View>
                )
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* 특이사항 섹션 */}
      {data.specialNotes && (
        <View style={styles.specialNotesSection}>
          <Text style={styles.title}>4. 특이사항</Text>
          <Text style={styles.value}>{data.specialNotes}</Text>
        </View>
      )}

      {/* 이미지 섹션 */}
      {data.images && data.images.length > 0 && (
        <View style={styles.imageSection}>
          <Text style={styles.title}>5. 첨부 이미지</Text>
          <View style={styles.imageGrid}>
            {data.images.map((image, index) => (
              <Image
                key={index}
                src={`http://localhost:8080/uploads/images/${image}`}
                style={styles.image}
              />
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export default InspectionPDF; 