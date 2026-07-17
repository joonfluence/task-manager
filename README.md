# 📝 할 일 관리 서비스

체계적인 계획 관리를 위한 웹 기반 할 일 관리 서비스입니다.

## ✨ 주요 기능

- **7개 섹션 관리**: 챌린지, 틈틈히 리스트, 어려운 작업, 쉬운 작업, 완료 현황, 오늘의 목표, 주간 계획
- **할 일 관리**: 추가, 완료/미완료 토글, 삭제
- **진행률 표시**: 섹션별 진행률 프로그래스바
- **통계**: 섹션별 완료 현황
- **반응형 디자인**: 모바일/데스크톱 지원

## 🛠️ 기술 스택

### 프론트엔드
- React 19
- Vite
- CSS3 (Flexbox, Grid)

### 백엔드
- Express.js
- SQLite3
- Node.js

## 🚀 시작하기

### 설치

```bash
# 백엔드 의존성 설치
cd server
npm install

# 프론트엔드 의존성 설치
cd ../client
npm install
```

### 개발 모드

#### 프론트엔드 (별도 터미널에서)
```bash
cd client
npm run dev
```

#### 백엔드
```bash
cd server
PORT=3001 npm start
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

### 프로덕션 빌드

```bash
# 프론트엔드 빌드
cd client
npm run build

# 백엔드 실행
cd ../server
PORT=3001 npm start
```

## 📁 프로젝트 구조

```
task-manager/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx        # 메인 컴포넌트
│   │   ├── App.css        # 스타일
│   │   └── main.jsx       # 진입점
│   ├── vite.config.js
│   └── package.json
├── server/                # Express 백엔드
│   ├── index.js           # 메인 서버
│   ├── db.js              # SQLite 설정
│   ├── routes.js          # API 라우트
│   └── package.json
├── .gitignore
└── README.md
```

## 🔌 API 엔드포인트

### 할 일 관리
- `GET /api/tasks` - 모든 할 일 조회
- `GET /api/tasks/section/:section` - 섹션별 할 일 조회
- `POST /api/tasks` - 새 할 일 추가
- `PATCH /api/tasks/:id` - 할 일 수정 (완료 상태, 제목 등)
- `DELETE /api/tasks/:id` - 할 일 삭제

### 통계
- `GET /api/stats` - 섹션별 통계

## 📝 사용 예시

```bash
# 새 할 일 추가
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"section":"today","title":"학습하기"}'

# 할 일 완료 표시
curl -X PATCH http://localhost:3001/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

## 🎨 UI 디자인

- 그래디언트 헤더 (Purple & Blue)
- 섹션별 사이드바 네비게이션
- 반응형 그리드 레이아웃
- 다크모드 지원 준비

## 📄 라이센스

MIT License
