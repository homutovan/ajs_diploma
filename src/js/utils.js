export const changePlayers = { good: 'evil', evil: 'good' };

export function calcTileType(index, board) {
  const len = board.length;
  return board[(index - (index % len)) / len][index % len];
}

export function distanceMetric(pointA, pointB, boardSize) {
  const pointAX = pointA % boardSize;
  const pointBX = pointB % boardSize;
  const pointAY = Math.floor(pointA / boardSize);
  const pointBY = Math.floor(pointB / boardSize);
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

export function getBoardIndex(boardSize) {
  return Array(boardSize ** 2).fill('').map((_, i) => i);
}

export function getPropagation(index, radius, boardSize) {
  const metric = (element) => distanceMetric(element, index, boardSize);
  return getBoardIndex(boardSize)
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

export function getTimer(count) {
  return (new Date(0, 0, 0, 0, 0, count)).toLocaleString(
    'ru', {
      minute: 'numeric',
      second: 'numeric',
    },
  );
}

export function calcDamage(attack, defense) {
  return Math.floor(Math.max(attack - defense, attack * 0.1));
}

export function getAnchorPoint(pointList, boardSize) {
  const col = Math.floor(
    pointList
      .map((element) => element % boardSize)
      .reduce((acc, element) => acc + element) / pointList.length,
  );
  const row = Math.floor(
    pointList
      .map((element) => Math.ceil(element / boardSize))
      .reduce((acc, element) => acc + element) / pointList.length,
  );
  return row * boardSize + col;
}

export function getExtraRestriction(propogation, restriction, initRadius, position, boardSize) {
  const currentRestriction = restriction
    .filter((element) => propogation.includes(element));
  const rowPosition = Math.floor(position / boardSize);
  const colPosition = position % boardSize;
  const extraRestriction = [];
  for (const point of currentRestriction) {
    const rowPoint = Math.floor(point / boardSize);
    const colPoint = point % boardSize;
    const deltaRow = Math.sign(rowPoint - rowPosition);
    const deltaCol = Math.sign(colPoint - colPosition);
    const deltaPoint = deltaRow * boardSize + deltaCol;
    const radius = Math.abs(deltaRow || deltaCol);
    for (let step = radius; step < initRadius; step += 1) {
      const nextPoint = point + deltaPoint * step;
      extraRestriction.push(nextPoint);
    }
  }
  return extraRestriction;
}
