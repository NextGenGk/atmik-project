import { useEffect } from "react";

export function ChatWidget() {
  useEffect(() => {
    // Only run on the client side, ensure it's not already added
    if (document.getElementById("sitebot-script")) {
      return;
    }

    const scriptUrl = import.meta.env.VITE_SITEBOT_SCRIPT_URL || "https://www.sitebot.online/embed.js";
    const namespace = import.meta.env.VITE_SITEBOT_NAMESPACE || "atmikbharat-com-1786444078580";

    const script = document.createElement("script");
    script.id = "sitebot-script";
    script.src = scriptUrl;
    script.setAttribute("data-namespace", namespace);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Optional cleanup if component unmounts
      const existingScript = document.getElementById("sitebot-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
