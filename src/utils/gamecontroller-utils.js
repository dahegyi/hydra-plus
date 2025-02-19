export const activeButtons = {};

export function isButtonPressed(identifier) {
  return !!activeButtons[identifier];
}
