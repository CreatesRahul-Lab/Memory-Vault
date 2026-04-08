// Content script: extracts page metadata, highlights, and full-page content
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
    else if (url.endsWith(".pdf") || url.includes("/pdf")) type = "pdf";

    // Get selected text
    const selectedText = window.getSelection()?.toString() || "";

    // Extract main content (article body or main content)
    let fullContent = "";
    const article = document.querySelector("article") || document.querySelector("main") || document.querySelector('[role="main"]');
    if (article) {
      fullContent = article.innerText?.substring(0, 5000) || "";
    }

    // Try to detect transcript content (YouTube, podcast pages)
    let transcript = "";
    if (type === "video") {
      // YouTube transcript segments
      const transcriptEls = document.querySelectorAll(
        "ytd-transcript-segment-renderer .segment-text, .ytd-transcript-segment-renderer"
      );
      if (transcriptEls.length > 0) {
        transcript = Array.from(transcriptEls)
          .map((el) => el.textContent?.trim())
          .filter(Boolean)
          .join(" ");
      }
    }

    // Extract structured highlights (selection + context)
    const highlights = [];
    if (selectedText) {
      highlights.push({
        text: selectedText.substring(0, 1000),
        color: "#e8b931",
        note: "",
      });
    }

    sendResponse({
      url,
      title: document.title,
      description: getMeta("og:description") || getMeta("description"),
      domain: window.location.hostname,
      favicon,
      type: transcript ? "transcript" : type,
      selectedText,
      fullContent,
      transcript,
      highlights,
    });
  }

  if (msg.type === "CAPTURE_FULL_PAGE") {
    const body = document.body.innerText?.substring(0, 10000) || "";
    sendResponse({ content: body });
  }

  return true;
});

// Smart highlight: user can right-click on selected text
// This is handled by the background script context menu
