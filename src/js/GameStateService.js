export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
    this.loadStatus = this.checkLoadStatus();
    // this.mark = this.getTimeMark();
  }

  checkLoadStatus() {
    try {
      const state = JSON.parse(this.storage.getItem('state'));
      return true;
    } catch (e) {
      return false;
    }
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    try {
      const state = JSON.parse(this.storage.getItem('state'));
      this.getSaveList();
      if (!state) throw new Error('Invalid state');
      return state;
    } catch (e) {
      this.loadStatus = false;
      throw new Error('Invalid state');
    }
  }

  getSaveList() {
    const saveList = [];
    const len = this.storage.length;
    for (let i = 0; i < len; i += 1) {
      saveList.push(this.storage.key(i));
    }
    return saveList;
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
