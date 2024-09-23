export const HTML = (() => {
  const des = new DOMParser();
  const ser = new XMLSerializer();

  return {
    parse: (html: string) => {
      return des.parseFromString(html, "text/html");
    },
    stringify: (doc: Document) => {
      return ser.serializeToString(doc);
    },
  };
})();

export function injectCssLink(html: string, cssUrl: string) {
  const doc = HTML.parse(html);
  const cssLink = doc.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = cssUrl;
  doc.head.appendChild(cssLink);
  return HTML.stringify(doc);
}
