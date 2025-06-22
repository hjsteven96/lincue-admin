# Lincue Admin Panel

Next.js 기반의 Lincue 서비스 백오피스 관리 시스템입니다.

## 기능

- **관리자 인증**: 간단한 이메일/패스워드 로그인 (admin/1234)
- **사용자 관리**: 사용자 목록 조회 및 요금제 변경
- **영상 관리**: YouTube 영상 수동 등록 및 Gemini 분석 결과 입력

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일에 Firebase 및 YouTube API 설정을 추가하세요.

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 로그인 정보

- 이메일/사용자명: `admin`
- 패스워드: `1234`

## 주요 페이지

- `/login` - 관리자 로그인
- `/admin` - 대시보드
- `/admin/users` - 사용자 관리
- `/admin/videos` - 영상 목록
- `/admin/videos/new` - 새 영상 등록

## Firebase 설정

Firebase 프로젝트 설정 후 다음 환경 변수를 설정하세요:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# YouTube Data API
YOUTUBE_DATA_API_KEY=your-youtube-api-key

# Admin Credentials
ADMIN_EMAIL=admin
ADMIN_PASSWORD=1234
```

## 데이터베이스 구조

### users/{uid}
- `uid`: Firebase Auth UID
- `email`: 사용자 이메일
- `displayName`: 사용자 이름
- `plan`: "free" | "plus" | "pro"
- `createdAt`: 생성일
- `usage`: 사용량 정보

### videoAnalyses/{videoId}
- `videoId`: YouTube 영상 ID
- `youtubeTitle`: 영상 제목
- `youtubeDescription`: 영상 설명
- `thumbnailUrl`: 썸네일 URL
- `duration`: 영상 길이 (초)
- `timestamp`: 등록일
- `analysis`: Gemini 분석 결과
- `transcript_text`: 전체 텍스트

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Authentication**: 커스텀 인증 시스템
