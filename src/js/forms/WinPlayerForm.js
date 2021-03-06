import Form from './Form';

export default class WinPlayerForm extends Form {
  fillForm() {
    this.totalScoreElement = this.modal.querySelector('.total-score');
    this.totalScoreElement.innerText = this.game.score;
  }

  dismis(event) {
    this.game.gameNext();
    this.close();
  }
}
