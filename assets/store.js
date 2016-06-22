import { createStore } from 'redux';

export default createStore(function (state, action) {
  if (!state) state = [];
  switch (action.type) {
    case 'RECEIVE_MESSAGE':
      let { isWhisper, msg, from } = action;
      return state.concat({
        isWhisper,
        msg,
        from
      });
    default:
      return state;
  }
});
