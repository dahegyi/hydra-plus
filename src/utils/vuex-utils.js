import { computed } from "vue";

export function stateToProps(state, props) {
  const storeProps = {};
  props.forEach((prop) => {
    storeProps[prop] = computed(() => state[prop]);
  });
  return storeProps;
}

export function createDispatchAction(store) {
  return function dispatchAction(action) {
    return function (payload) {
      return store.dispatch(action, payload);
    };
  };
}
