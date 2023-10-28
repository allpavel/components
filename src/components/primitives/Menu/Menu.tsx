type Direction = "ltr" | "rtl";
type Submenu = Record<Direction, string[]>;
/* eslint-disable */
const SELECTION = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN: Submenu = {
  ltr: [...SELECTION, "ArrowRight"],
  rtl: [...SELECTION, "ArrowLeft"],
};

const SUB_CLOSE: Submenu = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
};

const MENU_NAME = "Menu";
