if (typeof globalThis.Iterator === "undefined") {
  globalThis.Iterator = class Iterator {};
  if (!globalThis.Iterator.from) {
    globalThis.Iterator.from = (iterable) => iterable;
  }
}

import "@testing-library/jest-dom/vitest";
