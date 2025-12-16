function createStore(initialState) {
  let state = Object.freeze({ ...initialState });
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(updater) {
    const nextState =
      typeof updater === 'function' ? updater(state) : { ...updater };

    state = Object.freeze({ ...state, ...nextState });

    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(state);

    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getState,
    setState,
    subscribe
  };
}

module.exports = {
  createStore
};
