import { storeToRefs } from "pinia";

export function stateToProps(store, props) {
  const storeRefs = storeToRefs(store);
  const storeProps = {};

  props.forEach((prop) => {
    if (prop in storeRefs) {
      // State
      storeProps[prop] = storeRefs[prop];
    } else if (prop in store) {
      // Actions & getters
      storeProps[prop] = store[prop];
    }
  });

  return storeProps;
}
