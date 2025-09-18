/// <reference lib="webworker" />
import { load } from "cheerio"
import { XMLSerializer } from "xmldom"

class DOMParser {
  parseFromString(html: string, _: string) {
    const $ = load(html, { xmlMode: false })

    return {
      // tương đương document.body
      body: {
        querySelectorAll: (selector: string) => {
          const nodes = $(selector).toArray()
          return nodes.map((node) => wrapElement($(node), $))
        }
      },
      createElement: (tag: string) => {
        return wrapElement($(`<${tag}></${tag}>`), $)
      },
      // tiện: lấy lại html cuối
      toString: () => $.html()
    }
  }
}

function wrapElement($el: cheerio.Cheerio, $: cheerio.CheerioAPI): any {
  return {
    get tagName() {
      return $el[0]?.tagName || ""
    },
    get attributes() {
      return Object.entries($el.attr() || {}).map(([name, value]) => ({
        name,
        value: value ?? ""
      }))
    },
    get innerHTML() {
      return $el.html() || ""
    },
    set innerHTML(v: string) {
      $el.html(v)
    },
    get outerHTML() {
      return $.html($el)
    },
    setAttribute: (name: string, value: string) => {
      $el.attr(name, value)
    },
    removeAttribute: (name: string) => {
      $el.removeAttr(name)
    },
    replaceWith: (other: any) => {
      $el.replaceWith(other.__el || other)
    },
    remove: () => {
      $el.remove()
    },
    get src() {
      return $el.attr("src") || ""
    },
    set src(v: string) {
      $el.attr("src", v)
    },
    get alt() {
      return $el.attr("alt") || ""
    },
    set alt(v: string) {
      $el.attr("alt", v)
    },
    __el: $el
  }
}

Object.assign(globalThis, { window: globalThis, DOMParser, XMLSerializer })

let locationHref: string = ""
export function setLocationHref(href: string) {
  locationHref = href
}
const _fetch = globalThis.fetch.bind(globalThis)

globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  let url: string | URL

  if (typeof input === "string" || input instanceof URL) {
    const raw = input.toString()
    if (raw.startsWith("/")) {
      url = new URL(raw, locationHref)
    }
    else {
      url = raw
    }
  }
  else {
    // trường hợp input là Request object
    const raw = input.url
    url = raw.startsWith("/") ? new URL(raw, locationHref) : raw
  }

  return _fetch(url, init)
}
