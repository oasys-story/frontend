import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// 폰트 등록 부분 수정
Font.register({
  family: 'Pretendard',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Medium.woff',
      fontWeight: 500,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Bold.woff',
      fontWeight: 700,
    }
  ]
});

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: 'white',
    fontFamily: 'Pretendard',
    position: 'relative', // 로고 배치 위한 설정
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 30,
  },
  companyInfo: {
    fontSize: 8,
    marginLeft: 10,
  },
  signatureTable: {
    border: 1,
    borderColor: '#000',
    width: 200,
  },
  header: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    borderBottom: 1,
    paddingBottom: 10,
    fontFamily: 'Pretendard',
    fontWeight: 700,  // 볼드 처리
  },
  section: {
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    backgroundColor: '#1C243A',
    color: 'white',
    padding: 5,
    marginBottom: 5,
    fontFamily: 'Pretendard',
    fontWeight: 500,  // 미디엄 처리
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 10,
    alignItems: 'center'
  },
  topLeftSection: {
    width: '50%' // 점검자 제거 후 너비 조정
  },
  approvalTable: {
    width: '50%',
    border: 1,
    borderColor: '#000',
  },
  approvalRow: {
    flexDirection: 'row',
  },
  approvalCell: {
    flex: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 10,
    paddingVertical: 3,
  },
  signatureBox: {
    flex: 1,
    height: 20,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
  },
  signatureBoxBottom: {
    flex: 1,
    height: 20,
    borderRight: 0,
    borderBottom: 0,
    borderColor: '#000',
    backgroundColor: '#f8f8f8',

  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    width: '25%',
    fontSize: 9,
    fontFamily: 'Pretendard',
  },
  infoValue: {
    width: '75%',
    fontSize: 10,
    fontFamily: 'Pretendard',
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
    fontFamily: 'Pretendard',
    fontSize: 10,
    padding: 5,
    color: 'white'
  },
  tableCell: {
    flex: 1,
    padding: 3,
    fontSize: 8,
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
    fontFamily: 'Pretendard'
  },
  value: {
    width: '70%',
    fontSize: 12,
    fontFamily: 'Pretendard'
  },
  measurementSection: {
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Pretendard'
  },
  measurementTablesContainer: {
    flexDirection: 'row',  // 가로 배치
    justifyContent: 'space-between',  // 테이블 간격 균등 분배
    width: '100%',
  },
  measurementTable: {
    width: '32%',  // 3개 테이블이 들어갈 수 있도록 너비 조정
    border: 1,
    borderColor: '#000',
  },
  measurementHeaderRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#000',
  },
  measurementRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#000',
    height: 25,  // 행 높이 조정
  },
  measurementHeaderCell: {
    width: '25%',
    padding: 2,
    fontSize: 7,
    borderRight: 1,
    borderColor: '#000',
    textAlign: 'center',
  },
  measurementCell: {
    width: '25%',
    padding: 2,
    fontSize: 7,
    borderRight: 1,
    borderColor: '#000',
    textAlign: 'center',
  },
  measurementLabel: {
    position: 'absolute',
    top: -15,
    left: 0,
    fontSize: 8,
  },
  imagesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  imageWrapper: {
    width: '50%',  // 레이아웃은 50:50 유지
    padding: 5,
    height: 200,   // 이미지 컨테이너 높이 고정
    display: 'flex',
    alignItems: 'center',  // 이미지 가운데 정렬
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',  // 'cover' 대신 'contain' 사용하여 비율 유지
  },
  imageCaption: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    color: '#666',
  },
  signature: {
    width: 150,
    height: 70
  },
  signatureRow: {
    flexDirection: 'row',
  },
  signatureCell: {
    flex: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 9,
    paddingVertical: 3,
  },
    signatureCellRight: {
    flex: 1,
    borderRight: 0,
    borderBottom: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 9,
    paddingVertical: 3,
  },
  checklistTable: {
    width: '100%',
    borderTop: 1,
    borderLeft: 1,
    borderColor: '#000',
  },
  checklistRow: {
    flexDirection: 'row',
    height: 40,  // 고정 높이 설정
  },
  firstColumn: {
    width: '10%',
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,  // 글자 크기 축소
    fontFamily: 'Pretendard',
  },
  itemColumn: {
    width: '6%',
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
  },
  itemHeader: {
    height: '50%',
    borderBottom: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 6,
    padding: 2,
    fontFamily: 'Pretendard',
  },
  itemValue: {
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
    fontFamily: 'Pretendard',
  },
  checklistHeader: {
    fontSize: 7,
    textAlign: 'center',
  },
  checklistValue: {
    fontSize: 9,
    textAlign: 'center',
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
  },
  basicInfoTable: {
    marginTop: 5,
    width: '100%',
  },
  basicInfoRow: {
    flexDirection: 'row',
    borderTop: 1,
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    height: 30,
  },
  basicInfoCell: {
    flex: 1,
    borderRight: 1,
    borderColor: '#000',
    padding: 2,
  },
  basicInfoText: {
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitText: {
    fontSize: 8,
    marginLeft: 2,
  },
  safetyEducationSection: {
    border: 1,
    borderColor: '#000',
  },
  safetyHeader: {
    borderBottom: 1,
    borderColor: '#000',
    padding: 5,
  },
  safetyHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
  },
  safetyContent: {
    padding: 5,
  },
  safetyList: {
    marginBottom: 10,
  },
  safetyItem: {
    fontSize: 9,
    marginBottom: 3,
    fontFamily: 'Pretendard',
  },
  opinionRow: {
    flexDirection: 'row',
    borderTop: 1,
    borderColor: '#000',
  },
  opinionLabel: {
    width: '15%',
    borderRight: 1,
    borderColor: '#000',
    padding: 5,
    fontSize: 9,
    fontFamily: 'Pretendard',
  },
  opinionContent: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    fontFamily: 'Pretendard',
    minHeight: 50,  // 의견 작성 공간 확보
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20, // 상단 여백 추가
    borderTop: 1,
    paddingTop: 10, // 상단 패딩 추가
  },
  noBorderTop: {
    borderTop: 0, // 상단 구분선 제거
  },
  noBorderBottom: {
    borderBottom: 0, // 하단 구분선 제거
  },
  pdfFooterText: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#000',
  },
});

// 이미지 섹션 추가
const ImagesSection = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.section} break>
      <Text style={styles.title}>현장 사진</Text>
      <View style={styles.imagesContainer}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              src={`http://localhost:8080/uploads/images/${image}`}
              style={styles.image}
            />
            <Text style={styles.imageCaption}>현장사진 {index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// PDF 문서 컴포넌트
const InspectionPDF = ({ data, checklistLabels, getStatusText }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>전기설비 점검 결과서</Text>

      {/* 상단 섹션 */}
      <View style={styles.topSection}>
        {/* 좌측: 기본 정보 (점검자 제거) */}
        <View style={styles.topLeftSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>업체명</Text>
            <Text style={styles.infoValue}>{data.companyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>점검일자</Text>
            <Text style={styles.infoValue}>{data.inspectionDate}</Text>
          </View>
        </View>

        {/* 우측: 결재란 (이미지 참고) */}
        <View style={styles.approvalTable}>
          {/* 첫 번째 행 (결재) - 구분선 없음 */}
          <View style={styles.approvalRow}>
            <Text style={[styles.approvalCell, styles.noBorderBottom]}>결</Text>
            <Text style={styles.approvalCell}>담당</Text>
            <Text style={styles.approvalCell}></Text>
            <Text style={styles.approvalCell}></Text>
          </View>
          {/* 두 번째 행 (결재) - 구분선 없음 */}
          <View style={styles.approvalRow}>
            <Text style={[styles.approvalCell, styles.noBorderTop]}>재</Text>
            <View style={styles.signatureBox} />
            <View style={styles.signatureBox} />
            <View style={styles.signatureBox} />
          </View>
        </View>

      </View>


      {/* 기본사항 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>1. 기본사항</Text>
        <View style={styles.basicInfoTable}>
          <View style={styles.basicInfoRow}>
            {/* 첫 번째 줄 */}
            <View style={[styles.basicInfoCell, { flex: 2 }]}>
              <View style={styles.basicInfoText}>
                <Text>수전전압/용량</Text>
                <Text>{data.faucetVoltage}　V / {data.faucetCapacity}　kW</Text>
              </View>
            </View>
            <View style={[styles.basicInfoCell, { flex: 2 }]}>
              <View style={styles.basicInfoText}>
                <Text>발전전압/용량</Text>
                <Text>{data.generationVoltage}　V / {data.generationCapacity}　kW</Text>
              </View>
            </View>
            <View style={[styles.basicInfoCell, { flex: 1 }]}>
              <View style={styles.basicInfoText}>
                <Text>태양광</Text>
                <Text>{data.solarCapacity}　kW</Text>
              </View>
            </View>
          </View>
          <View style={styles.basicInfoRow}>
            {/* 두 번째 줄 */}
            <View style={[styles.basicInfoCell, { flex: 2 }]}>
              <View style={styles.basicInfoText}>
                <Text>계약용량</Text>
                <Text>{data.contractCapacity}　kW</Text>
              </View>
            </View>
            <View style={[styles.basicInfoCell, { flex: 2 }]}>
              <View style={styles.basicInfoText}>
                <Text>점검종별</Text>
                <Text>{data.inspectionType}</Text>
              </View>
            </View>
            <View style={[styles.basicInfoCell, { flex: 1 }]}>
              <View style={styles.basicInfoText}>
                <Text>점검횟수</Text>
                <Text>{data.inspectionCount}　회</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 점검내역 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>2. 점검내역</Text>
        <View style={styles.checklistTable}>
          {/* 고압설비 행 */}
          <View style={styles.checklistRow}>
            <View style={styles.firstColumn}>
              <Text>고압설비</Text>
            </View>
            {[
              { id: 'aerialLine', label: '가공\n전선로' },
              { id: 'undergroundWireLine', label: '지중\n전선로' },
              { id: 'powerSwitch', label: '수배전용\n개폐기' },
              { id: 'busbar', label: '배선\n(모선)' },
              { id: 'lightningArrester', label: '피뢰기' },
              { id: 'transformer', label: '변성기' },
              { id: 'powerFuse', label: '전력\n퓨즈' },
              { id: 'powerTransformer', label: '변압기' },
              { id: 'incomingPanel', label: '수배\n전반' },
              { id: 'relay', label: '계전\n기류' },
              { id: 'circuitBreaker', label: '차단\n기류' },
              { id: 'powerCapacitor', label: '전력용\n콘덴서' },
              { id: 'protectionEquipment', label: '보호\n설비' },
              { id: 'loadEquipment', label: '부하\n설비' },
              { id: 'groundingSystem', label: '접지\n설비' }
            ].map((item) => (
              <View key={item.id} style={styles.itemColumn}>
                <View style={styles.itemHeader}>
                  <Text>{item.label}</Text>
                </View>
                <View style={styles.itemValue}>
                  <Text>{data[item.id] || '/'}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 저압설비 행 */}
          <View style={styles.checklistRow}>
            <View style={styles.firstColumn}>
              <Text>저압설비</Text>
            </View>
            {[
              { id: 'wiringInlet', label: '인입구\n배선' },
              { id: 'distributionPanel', label: '배·분\n전반' },
              { id: 'moldedCaseBreaker', label: '배선용\n차단기' },
              { id: 'earthLeakageBreaker', label: '누전\n차단기' },
              { id: 'switchGear', label: '개폐기' },
              { id: 'wiring', label: '배선' },
              { id: 'motor', label: '전동기' },
              { id: 'heatingEquipment', label: '전열\n설비' },
              { id: 'welder', label: '용접기' },
              { id: 'capacitor', label: '콘덴서' },
              { id: 'lighting', label: '조명\n설비' },
              { id: 'grounding', label: '접지\n설비' },
              { id: 'internalWiring', label: '구내\n전선로' },
              { id: 'generator', label: '발전\n설비' },
              { id: 'otherEquipment', label: '기타\n설비' }
            ].map((item) => (
              <View key={item.id} style={styles.itemColumn}>
                <View style={styles.itemHeader}>
                  <Text>{item.label}</Text>
                </View>
                <View style={styles.itemValue}>
                  <Text>{data[item.id] || '/'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 측정개소 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>3. 측정개소</Text>
        <View style={styles.measurementTablesContainer}>
          {[1, 2, 3].map((tableIndex) => {
            const measurement = data.measurements.find(m => m.measurementNumber === tableIndex) || {};
            
            return (
              <View key={tableIndex} style={styles.measurementTable}>
                <View style={styles.measurementHeaderRow}>
                  <Text style={styles.measurementHeaderCell}>구분</Text>
                  <Text style={styles.measurementHeaderCell}>전압(V)</Text>
                  <Text style={styles.measurementHeaderCell}>전류(A)</Text>
                  <Text style={[styles.measurementHeaderCell, { borderRight: 0 }]}>온도(℃)</Text>
                </View>
                {['A-', 'B-', 'C-', 'N'].map((phase) => (
                  <View key={phase} style={styles.measurementRow}>
                    <Text style={styles.measurementCell}>{phase}</Text>
                    <Text style={styles.measurementCell}>
                      {measurement[`voltage${phase.charAt(0)}`] || ''}
                    </Text>
                    <Text style={styles.measurementCell}>
                      {measurement[`current${phase.charAt(0)}`] || ''}
                    </Text>
                    <Text style={[styles.measurementCell, { borderRight: 0 }]}>
                      {measurement[`temperature${phase.charAt(0)}`] || ''}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </View>

      {/* 특이사항 섹션 */}
      <View style={styles.section}>
        <Text style={styles.title}>4. 안전교육 및 종합의견</Text>
        <View style={styles.safetyEducationSection}>
          <View style={styles.safetyHeader}>
            <Text style={styles.safetyHeaderText}>전기안전교육 및 주의사항</Text>
          </View>
          <View style={styles.safetyContent}>
            <View style={styles.safetyList}>
              <Text style={styles.safetyItem}>1. 물기에 젖은 손발일 경우 전기기계 기구류의 조작을 금하십시오.</Text>
              <Text style={styles.safetyItem}>2. 각 기기의 접지선 탈락 여부를 수시로 확인하여 건지감전 사고를 예방하십시오.</Text>
              <Text style={styles.safetyItem}>3. 전기 담당자 외 임의로 전기기기 조작이나 보수를 금하십시오.</Text>
              <Text style={styles.safetyItem}>4. 금속제 외함을 갖는 전기기기, 가구 등에는 반드시 누전차단기로 보호하여 주십시오.</Text>
              <Text style={styles.safetyItem}>5. 일과 종료 후 사용하지 않는 전원 차단기는 개방하십시오.</Text>
              <Text style={styles.safetyItem}>6. 수, 변전실 출입문에 잠금장치를 하고 전기 담당자 이외 출입을 금하도록 하십시오오.</Text>
              <Text style={styles.safetyItem}>7. 전기설비의 개·보수 작업은 반드시 정전상태에서 실시하시기 바랍니다.</Text>
            </View>
            <View style={styles.opinionRow}>
              <Text style={styles.opinionLabel}>종합 의견</Text>
              <Text style={styles.opinionContent}>{data.specialNotes || ''}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 하단 레이아웃 */}
      <View style={styles.footer}>
        {/* 왼쪽 - 로고 & 회사 정보 */}
        <View style={styles.logoContainer}>
          <Image src="/images/sobang.png" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>(주) 강동소방</Text>
            <Text>대전 서구 대덕대로 141 (갈마동) 2층, 201호(수정빌딩)</Text>
            <Text>0507-1343-1190</Text>
            <Text>0507-1343-1190</Text>
          </View>
        </View>

        {/* 오른쪽 - 서명란 */}
        <View style={styles.signatureTable}>
          <View style={styles.signatureRow}>
            <Text style={[styles.signatureCell, styles.noBorderBottom]}>확</Text>
            <Text style={styles.signatureCell}>점검 입회자</Text>
            <Text style={styles.signatureCell}></Text>
            <Text style={styles.signatureCellRight}>서명 또는 인</Text>
          </View>
          <View style={styles.signatureRow}>
            <Text style={[styles.signatureCell, styles.noBorderTop]}>인</Text>

            <Text style={styles.signatureCell}>전기 안전 관리자</Text>
            <Text style={styles.signatureCell}>{data.managerName}</Text>
            <Image src={data.signature || '/images/signature.png'} style={styles.signatureBoxBottom} />
          </View>
        </View>
      </View>

      <Text style={styles.pdfFooterText}>문의 www.oasyss.co.kr</Text>

      {/* 이미지 섹션 */}
      <ImagesSection images={data.images} />
    </Page>
  </Document>
);

export default InspectionPDF; 