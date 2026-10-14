// 프레임 이미지와 사진이 들어갈 칸 정보
// 좌표는 원본(941×1672) 기준 px. 이미지를 같은 레이아웃의 더 큰 파일로 바꿔도 비율로 맞춰짐

export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  chamfer: number; // 모서리를 사선으로 깎은 길이
}

export interface Frame {
  id: "white" | "black";
  label: string;
  src: string;
  baseWidth: number;
  slots: [Slot, Slot];
}

export const FRAMES: Frame[] = [
  {
    id: "white",
    label: "화이트",
    src: "/frames/white.jpg",
    baseWidth: 941,
    slots: [
      { x: 161, y: 391, w: 619, h: 459, chamfer: 24 },
      { x: 161, y: 868, w: 619, h: 458, chamfer: 23 },
    ],
  },
  {
    id: "black",
    label: "블랙",
    src: "/frames/black.jpg",
    baseWidth: 941,
    slots: [
      // 모서리마다 깎인 길이가 달라(16~26px) 사선 자르기 대신 색 판별(slotKey)로 맞춤.
      // 칸 바깥이 모두 진한 색이라 가능
      { x: 166, y: 396, w: 610, h: 450, chamfer: 0 },
      { x: 166, y: 869, w: 610, h: 448, chamfer: 0 },
    ],
  },
];

export const getFrame = (id: Frame["id"]) => FRAMES.find((f) => f.id === id) ?? FRAMES[0];
