// Manages document title alerts when Admin or Customer tab is backgrounded
let originalTitle = 'Sri Ramu Digital — Flex & Offset Printing';
let intervalId = null;

export const setOriginalTitle = (title) => {
  originalTitle = title;
  if (!intervalId) {
    document.title = title;
  }
};

export const startTabTitleAlert = (alertText, count = 1) => {
  if (typeof document === 'undefined') return;

  stopTabTitleAlert();
  const alertTitle = `(${count}) ${alertText} — Sri Ramu Digital`;

  // Alternate between alert title and original title if document is hidden
  let toggle = false;
  document.title = alertTitle;

  intervalId = setInterval(() => {
    if (document.hidden) {
      document.title = toggle ? alertTitle : `⚠️ ${alertText}!`;
      toggle = !toggle;
    } else {
      document.title = alertTitle;
    }
  }, 1500);
};

export const stopTabTitleAlert = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (typeof document !== 'undefined') {
    document.title = originalTitle;
  }
};
