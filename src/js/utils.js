export function calcTileType(index, board) {
  const len = board.length;
  return board[(index - (index % len)) / len][index % len];
}

export function getBoard(boardSize) {
  return [
    ['top-left', ...Array(boardSize - 2).fill('top'), 'top-right'],
    ...Array(boardSize - 2).fill(['left', ...Array(boardSize - 2).fill('center'), 'right']),
    ['bottom-left', ...Array(boardSize - 2).fill('bottom'), 'bottom-right'],
  ];
}

export function getPropagation(index, radius, boardSize) {
  const cells = [];
  for (let i = 1; i <= radius; i += 1) {
    for (let sign of [-1, 1]) {
      cells.push(index + i * sign);
      for (let offset of [-1, 0, 1]) {
        cells.push(index + (boardSize + offset) * i * sign);
      }
    }
  }
  return cells.filter((el) => el >= 0 && el <= boardSize ** 2 - 1);
}

export function calcHealthLevel(health) {
  if (health < 15) return 'critical';
  else if (health < 50) return 'normal';
  else return 'high';
}
