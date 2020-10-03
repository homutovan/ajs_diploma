export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
    // this.loadStatus = this.checkLoadStatus();
    // this.mark = this.getTimeMark();
  }

  // checkLoadStatus() {
  //   try {
  //     const state = JSON.parse(this.storage.getItem('autosave'));
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }

  save(state, name) {
    this.storage.setItem(`${name}save`, JSON.stringify(state));
  }

  delete(name) {
    this.storage.removeItem(name);
  }

  load(name) {
    try {
      const state = JSON.parse(this.storage.getItem(name));
      // this.getSaveList();
      if (!state) throw new Error('Invalid state');
      this.loadStatus = true;
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
      const key = this.storage.key(i);
      if (key.endsWith('save')) {
        saveList.push(key);
      }
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
