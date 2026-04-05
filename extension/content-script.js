// Content script: extracts page metadata when requested by popup or background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PAGE_DATA") {
    const getMeta = (name) => {
      const el =
        document.querySelector(`meta[property="${name}"]`) ||
        document.querySelector(`meta[name="${name}"]`);
      return el?.getAttribute("content") || "";
    };

    const favicon =
      document.querySelector('link[rel="icon"]')?.href ||
      document.querySelector('link[rel="shortcut icon"]')?.href ||
      `${window.location.origin}/favicon.ico`;

    // Detect content type
    let type = "page";
    const url = window.location.href;
    if (url.includes("youtube.com") || url.includes("youtu.be")) type = "video";
    else if (url.includes("twitter.com") || url.includes("x.com")) type = "tweet";
    else if (url.endsWith(".pdf")) type = "pdf";

    // Get selected text
    const selectedText = window.getSelection()?.toString() || "";

    sendResponse({
      url,
      title: document.title,
      description: getMeta("og:description") || getMeta("description"),
      domain: window.location.hostname,
      favicon,
      type,
      selectedText,
    });
  }
  return true;
});
