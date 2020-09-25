export default class Estimator {
  constructor(game) {
    this.game = game;
    this.players = {good: 'evil', evil: 'good'};
    this.side = this.players[this.game.side];
  }

  requestStrategy() {
    this.sideInvertor();
    console.log('zdzsdg')
  }

  sideInvertor() {
    this.game.side = this.players[this.game.side];
    this.side = this.players[this.side];
  }
}
