# 무해센터 입소자 인증사진

프레임을 고르고 2컷을 찍으면, 고른 프레임에 사진을 합성한 한 장의 인증사진을 만들어 QR로 받아 갈 수 있는 웹 포토부스입니다.

- 배포: https://photobooth-muhae.vercel.app
- 스택: Next.js (App Router), React, Vercel Blob, Vercel Cron

## 흐름

1. **프레임 선택**: 화이트 / 블랙 중 선택
2. **촬영**: 카운트다운 후 2컷
3. **출력**: 프레임의 두 칸에 사진을 합성해 한 장의 JPEG 생성, 동시에 서버 업로드
4. **결과**: QR 코드 표시 → 휴대폰으로 찍으면 `/p/[id]` 사진 받기 페이지가 열림

사진은 Vercel Blob(private)에 저장되고, 매일 cron(`/api/cron/cleanup`)이 7일이 지난 사진을 삭제합니다.

## 프레임 추가·교체

`public/frames/`에 이미지를 넣고 `app/lib/frames.ts`에 칸 좌표를 적습니다.

- 좌표는 `baseWidth` 기준 px입니다. 레이아웃이 같은 더 큰 이미지로 바꿔도 비율대로 맞춰집니다.
- 칸 안의 밝은 무채색 픽셀에만 사진이 보이도록 합성하기 때문에, 칸 위에 걸친 도장·테두리선은 사진 위에 그대로 남습니다.

## 로컬 실행

```bash
npm install
vercel env pull .env.local   # BLOB_READ_WRITE_TOKEN, CRON_SECRET
npm run dev
```

| 환경변수 | 설명 |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 스토어 토큰 (스토어 연결 시 자동 생성) |
| `CRON_SECRET` | 정리 cron 호출 인증용 |
| `BLOB_ACCESS` | 선택. public 스토어를 쓸 때만 `public` |

## 구조

```
app/
  page.tsx                   단계 전환 (select → shooting → printing → result)
  components/                화면 컴포넌트
  p/[id]/page.tsx            QR로 여는 사진 받기 페이지
  api/photo/route.ts         인증사진 업로드 → ID 발급
  api/photo/[id]/route.ts    인증사진 이미지 전달
  api/cron/cleanup/route.ts  보관 기간 지난 사진 삭제
  lib/frames.ts              프레임·칸 좌표
  lib/compose.ts             프레임 + 사진 합성
  lib/save.ts                기기별 저장 (iOS 공유 시트, 인앱 브라우저 길게 눌러 저장)
```
