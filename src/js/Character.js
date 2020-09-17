export const charStats = {
  bowman: {
    attack: 25,
    defence: 25,
    distance: 2,
    range: 2,
    side: 'good',
  },
  swordsman: {
    attack: 40,
    defence: 10,
    distance: 4,
    range: 1,
    side: 'good',
  },
  magician: {
    attack: 10,
    defence: 40,
    distance: 1,
    range: 4,
    side: 'good',
  },
  vampire: {
    attack: 25,
    defence: 25,
    distance: 2,
    range: 2,
    side: 'evil',
  },
  undead: {
    attack: 40,
    defence: 10,
    distance: 4,
    range: 1,
    side: 'evil',
  },
  daemon: {
    attack: 10,
    defence: 40,
    distance: 1,
    range: 4,
    side: 'evil',
  },
};

export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.health = 50;
    this.type = type;
    if (new.target.name === 'Character') {
      throw new Error('Creating objects Character using new is illegal!');
    }
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (charStats[value] === undefined) {
      throw new Error('Invalid type of character!');
    } else {
      ({ 
        attack: this.attack, 
        defence: this.defense,
        distance: this.distance,
        range: this.range,
        side: this.side, 
      } = charStats[value]);
      this._type = value;
    }
  }

  levelUp() {
    this.level += 1;
    this.health = (this.health < 20) ? this.health + 80 : 100;
    this.attack = this.statUp(this.attack);
    this.defense = this.statUp(this.defense);
  }

  statUp(stat) { // Разобраться с формулой
    return Math.max(stat, (stat * (1.8 - this.health)) / 100);
  }
}
