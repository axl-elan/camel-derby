export const $ = (selector, root = document) => root.querySelector(selector);

/** Returns a fresh copy of the first element inside a <template>. */
export function cloneTemplate(id) {
  return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const screens = ['setup', 'race'];

export function showScreen(name) {
  for (const id of screens) document.getElementById(id).hidden = id !== name;
  $('#resultOverlay').hidden = true;
}
