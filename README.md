# Hako EPub Extension

A browser extension that allows you to download EPub files directly from light novel websites. The generated EPub files follow standard formats, making them fully compatible with **Calibre** and easy to transfer to your **Kindle** (developed and tested on Kindle PaperWhite 3).

> [!TIP]
> I also developed a [**KOReader plugin**](https://github.com/tachibana-shin/rakuyomi) that allows you to read manga online directly on your Kindle without needing a computer!

## List website support

<!-- @list website support -->
- https://baka-tsuki.org
- https://beetruyen.net
- https://dammy.me
- https://docln.net
- https://docln.sbs
- https://foxaholic.com
- https://hako.vip
- https://hako.vip
- https://hako.vn
- https://ln.3ktan.com
- https://ln.hako.vn
- https://luvevaland.co
- https://mimieuuyen.com
- https://mintteanovel.com
- https://monkeydtruyen.com
- https://msvtruyen.com
- https://novest.me
- https://otruyen.vn
- https://phongphongtam2.com
- https://sonako.fandom.com
- https://truyenqqko.com
- https://truyenqqpro.com
- https://truyenqqvip.com
- https://valvrareteam.net
- https://www.baka-tsuki.org
- https://www.foxaholic.com
<!-- @end -->

## Sponsor ☕

If you find this project useful please support me through:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/P5P3MM3H6)
| [<img src="https://user-images.githubusercontent.com/45375496/209764740-d202626d-4acd-4517-a5dc-e94993eeeb0a.png" width="80" />](https://me.momo.vn/tachibshin) | [<img src="https://user-images.githubusercontent.com/45375496/210380009-53fcdbb0-f6a4-4e7f-bfc9-e59938151805.png" width="80" />](https://anime-vsub.github.io/about/sponsors) |
| :------------------: | :--------------------: |
| [Momo](https://me.momo.vn/tachibshin) | [Timo or Bank](https://anime-vsub.github.io/about/sponsors) |

## 🚀 Installation Guide

### 1. Official Stores (Recommended for convenience)

You can find the extension on the following stores:

- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/hako-epub/jnfmghkcmckpobdomljpgkhegeklalko)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/hako-epub/)

⚠️ **Note:** Due to the store review process, versions available on the stores are often **outdated**. For the latest features and bug fixes, please follow the **Sideload** instructions below to get the latest version from GitHub.

### 2. Sideloading (Get the latest version from GitHub)

#### For Chrome / Edge / Brave (Chromium-based)

1. Download the source code (or `.zip` file) from the [Releases](https://github.com/tachibana-shin/hako-epub-extension/releases) section and extract it.
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the folder where you extracted the extension.

#### For Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file from your extracted folder.
   _(Note: Temporary add-ons in Firefox are removed when the browser is closed)._

## 🛠️ Adding a New Website (Registry)

To add support for a new website, you need to create a registry configuration file in the `registry/` directory.

### 1. Create a Configuration File

Create a new `.ts` file in `registry/` (e.g., `registry/mysite.ts`).

### 2. Define the Registry

Use the `defineRegistry` helper to define your site configuration:

```typescript
export default defineRegistry({
  domains: ["mysite.com"],
  lang: "vi", // Target language
  publisher: "My Site",

  // CSS Selector for elements where the download button should appear (e.g., volume headers)
  findBlocks: ".volume-header",

  // Logic to find the parent container of the volume to attach the component
  findTarget: (h3) => h3.closest(".volume-box")!,

  // Metadata extraction
  title: (h3, target) => h3.textContent!.trim(),
  findAuthor: (h3, target) => $(".author-name")?.textContent?.trim(),
  extractCover: (h3, target) => $(".cover-img")?.getAttribute("src"),
  description: (h3, target) => $(".summary")?.textContent?.trim(),
  findTags: (h3, target) => Array.from($$(".genre")).map((a) => a.textContent?.trim()),

  // Required queries for the crawler
  targetQueries: {
    bookTitle: ".series-title", // Selector for the main book title
    chapters: ".chapter-list a", // Selector for chapter links
    chaptersReverse: false, // Optional: Set to true if chapters are descending
    container: "#chapter-content" // Selector for the actual story text
  },

  // Optional hooks for content processing
  cleaner($) {
    // Remove unwanted elements using Cheerio
    $(".ads, .social-share").remove()
  },

  transformContainer($) {
    // Modify the content container (e.g., handling protected text)
    const content = $("#chapter-protected").text()
    // decryption logic here...
    return $
  },

  // Optional: Custom chapter title extraction
  getChapterTitle: (anchor) => anchor.querySelector(".title")?.textContent?.trim() || "Chapter",

  // Downloader configuration
  fetcherOptions: {
    concurrency: 5,
    sleep: 3000,
    retry: 3,
    delayError429: 15000
  },

  lazyDom: false // Set to true if content is loaded dynamically
})
```

### 3. Registry Options Detail

| Option               | Type                    | Description                                                                                                           |
| :------------------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `domains`            | `string[]`              | **Required**. List of domains where this config will be active.                                                       |
| `lang`               | `string \| Function`    | **Required**. Language code (e.g., `"vi"`, `"en"`) or a function that returns it.                                     |
| `publisher`          | `string`                | **Required**. Name of the site/publisher.                                                                             |
| `findBlocks`         | `string`                | **Required**. CSS selector for elements that trigger the download button (usually volume titles).                     |
| `findTarget`         | `Function`              | **Required**. Function to find the container element for a specific volume based on the header found by `findBlocks`. |
| `targetQueries`      | `Object`                | **Required**. CSS selectors used for crawling:                                                                        |
|                      | `.bookTitle`            | Selector for the main story title on the page.                                                                        |
|                      | `.chapters`             | Selector for links (`<a>`) to chapters within a volume.                                                               |
|                      | `.chaptersReverse`      | _Optional_. Set to `true` if chapters are listed in descending order.                                                 |
|                      | `.container`            | Selector for the main content area in the reading page.                                                               |
| `title`              | `Function`              | **Required**. Function to extract the volume title.                                                                   |
| `findAuthor`         | `Function`              | **Required**. Function to extract the author(s). Can return a string or an array of strings.                          |
| `extractCover`       | `Function`              | **Required**. Function to extract the URL of the cover image.                                                         |
| `description`        | `Function`              | _Optional_. Function to extract the book description.                                                                 |
| `findTags`           | `Function`              | _Optional_. Function to extract tags/genres.                                                                          |
| `cleaner`            | `Function`              | _Optional_. Hook to clean up the chapter content using Cheerio (`$`).                                                 |
| `transformContainer` | `Function`              | _Optional_. Hook to transform the content container (e.g., decryption logic).                                         |
| `preParse`           | `Function`              | _Optional_. Pre-process the raw HTML string before it is parsed by Cheerio.                                           |
| `getChapterTitle`    | `Function`              | _Optional_. Function to extract a custom chapter title from the link element.                                         |
| `getChapterHref`     | `Function`              | _Optional_. Function to extract a custom chapter href from the link element.                                          |
| `fetchChapter`       | `Function`              | _Optional_. Function to fetch the chapter content.                                                                    |
| `fetcherOptions`     | `Object`                | _Optional_. Configuration for the downloader:                                                                         |
|                      | `.concurrency`          | Number of simultaneous requests (default: 5).                                                                         |
|                      | `.sleep`                | Delay in milliseconds after each chapter download.                                                                    |
|                      | `.retry`                | Number of retry attempts for failed requests (chapters and cover).                                                    |
|                      | `.delayError429`        | Delay in milliseconds when encountering a 429 (Rate Limit) error.                                                     |
|                      | `.retryResource`        | Retry attempts for fonts/images. Use a lower value to avoid long waits for non-critical resources (default: 1).       |
|                      | `.fetchTimeoutResource` | Timeout in milliseconds between retries for fonts/images (default: 100).                                              |
| `lazyDom`            | `boolean`               | _Optional_. Set to `true` if the page loads content dynamically/lazily.                                               |

### 4. Use Utility Helpers

You can use pre-defined utilities in `registry/utils/` to make selection easier:

- `$`: Equivalent to `document.querySelector`.
- `$$`: Equivalent to `document.querySelectorAll`.
- `contains`: Find an element containing specific text.

### 5. Update the Website List

After adding your registry, run the following command to automatically update the list of supported websites in this `README.md`:

```bash
bun update-readme
```

## Screenshot

Hako
<img width="1365" height="767" alt="Ảnh chụp màn hình 2025-09-18 192942" src="https://github.com/user-attachments/assets/45b66c2f-92c7-49c6-9af2-8c3f6aab117f" />
<img width="1362" height="767" alt="Ảnh chụp màn hình 2025-09-18 193151" src="https://github.com/user-attachments/assets/c27a80c0-28e9-48b9-9188-d23c11acbce9" />
Sonako
<img width="1366" height="698" alt="image" src="https://github.com/user-attachments/assets/099ea509-9fe2-4473-8d5a-cf57ab54e50b" />
Baka Tsuki
<img width="1363" height="739" alt="image" src="https://github.com/user-attachments/assets/a4947ffa-ea9b-41b9-bef5-822ae2358861" />
