export const charStats = {
  Bowman: {
    attack: 25,
    defence: 25,
  },
  Swordsman: {
    attack: 40,
    defence: 10,
  },
  Magician: {
    attack: 10,
    defence: 40,
  },
  Vampire: {
    attack: 25,
    defence: 25,
  },
  Undead: {
    attack: 40,
    defence: 10,
  },
  Daemon: {
    attack: 10,
    defence: 40,
  },
  generic: {
    attack: 0,
    defence: 0,
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
      ({ attack: this.attack, defence: this.defense } = charStats[value]);
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
