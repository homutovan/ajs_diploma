export default class Estimator {
  constructor(game) {
    this.game = game;
  }

  async requestStrategy() {
    await setTimeout('', 1000);
    const response = { position: 30, action: this.game.movePosition, to: 29 };
    return response;
  }
}
