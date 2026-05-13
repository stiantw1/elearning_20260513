export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Ball {
  pos: Position;
  vel: Velocity;
  radius: number;
}

export interface Paddle {
  pos: Position;
  width: number;
  height: number;
}

export interface Brick {
  pos: Position;
  width: number;
  height: number;
  status: 1 | 0; // 1 = active, 0 = broken
  color: string;
}

export interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isGameWon: boolean;
}
