// 업로드된 인증사진 저장 규칙 (서버·클라이언트 공용)

export const PHOTO_RETENTION_DAYS = 7;
export const PHOTO_MAX_BYTES = 4_000_000; // Vercel 함수 요청 한도(4.5MB) 이내

// 사진 ID: 16바이트 랜덤 → base64url 22자
export const PHOTO_ID_RE = /^[A-Za-z0-9_-]{22}$/;

export const PHOTO_PREFIX = "photos/";
export const photoPathname = (id: string) => `${PHOTO_PREFIX}${id}.jpg`;
export const photoApiUrl = (id: string) => `/api/photo/${id}`;
export const photoPageUrl = (origin: string, id: string) => `${origin}/p/${id}`;

export const FILE_NAME = "muhae-center.jpg";
