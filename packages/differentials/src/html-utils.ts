import { JSDOM } from "jsdom";

export const HTML = (() => {
  return {
    parse: (htmlString: string) => new JSDOM(htmlString),
    stringify: (dom: JSDOM) => dom.serialize(),
  };
})();

export function anchorTags(dom: JSDOM) {
  return Array.from(dom.window.document.querySelectorAll("a"));
}

export function imgTags(dom: JSDOM) {
  return Array.from(dom.window.document.querySelectorAll("img"));
}

export function unLink(link: HTMLAnchorElement) {
  link.replaceWith(...link.childNodes);
}
