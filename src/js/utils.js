export function calcTileType(index, board) {
  const len = board.length;
  return board[(index - (index % len)) / len][index % len];
}

export function distanceMetric(pointA, pointB, boardSize) {
  const pointAX = pointA % boardSize;
  const pointBX = pointB % boardSize;
  const pointAY = (pointA - (pointA % boardSize)) / boardSize;
  const pointBY = (pointB - (pointB % boardSize)) / boardSize;
  let distance = ((pointAX - pointBX) ** 2 + (pointAY - pointBY) ** 2) ** 0.5;
  if (!Number.isInteger(distance)) {
    distance /= Math.SQRT2;
  }
  return +distance.toFixed(1);
}

export function getBoard(boardSize) {
  return [
    ['top-left', ...Array(boardSize - 2).fill('top'), 'top-right'],
    ...Array(boardSize - 2).fill(['left', ...Array(boardSize - 2).fill('center'), 'right']),
    ['bottom-left', ...Array(boardSize - 2).fill('bottom'), 'bottom-right'],
  ];
}

export function getPropagation(index, radius, boardSize) {
  const metric = (element) => distanceMetric(element, index, boardSize);
  return Array(boardSize ** 2).fill('').map((_, i) => i)
    .filter((element) => (element !== index)
      && metric(element) <= radius
      && Number.isInteger(metric(element)));
}

export function getRandomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function calcHealthLevel(health) {
  if (health < 15) return 'critical';
  if (health < 50) return 'normal';
  return 'high';
}

export function getTotalPropBySide(list, side, prop) {
  return list.filter((element) => element.character.side === side)
    .reduce((acc, element) => acc + element.character[prop], 0);
}
