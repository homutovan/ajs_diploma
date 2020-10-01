export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
    this.loadStatus = true;
    // this.mark = this.getTimeMark();
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    try {
      const state = JSON.parse(this.storage.getItem('state'));
      if (!state) throw new Error('Invalid state');
      return state;
    } catch (e) {
      this.loadStatus = false;
      throw new Error('Invalid state');
    }
  }

  // getTimeMark() {
    // return (new Date()).toLocaleString(
    //   'ru', {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    //     hour: 'numeric',
    //     minute: 'numeric',
    //     second: 'numeric',
    //   },
    // );
  // }
}
