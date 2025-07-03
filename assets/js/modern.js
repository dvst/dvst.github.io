// Modern JavaScript for enhanced user experience
document.addEventListener("DOMContentLoaded", function () {
  // YouTube Channel Configuration
  // 🔧 CONFIGURATION: Update these values with your actual channel information
  const YOUTUBE_CONFIG = {
    channelHandle: "@javitech_co",
    channelUsername: "javitech_co",
    // 📝 TO FIND YOUR CHANNEL ID:
    // 1. Go to your YouTube channel
    // 2. View page source (Ctrl+U or Cmd+U)
    // 3. Search for "channel_id" or look for a string starting with "UC"
    // 4. Replace 'YOUR_CHANNEL_ID_HERE' with your actual channel ID
    channelId: "UCdsLzrBOLNcHEWx1CyRrwdQ", // Replace with your actual channel ID (starts with UC...)

    // Alternative: If you know your channel's custom URL
    customUrl: "javitech_co", // Your channel's custom URL (without @)
  };

  // Function to fetch latest YouTube video using multiple methods
  async function fetchLatestYouTubeVideo() {
    console.log("🎥 Fetching latest YouTube video...");

    // Try methods in order of reliability
    const methods = [
      () => fetchFromRSSFeed(),
      () => fetchFromChannelId(),
      () => useChannelEmbedMethod(),
      () => useSearchMethod(),
    ];

    for (const method of methods) {
      try {
        await method();
        return; // Success! Exit the loop
      } catch (error) {
        console.log("Method failed, trying next:", error.message);
        continue;
      }
    }

    console.log("⚠️ All methods failed, keeping current video");
  }

  // Method 1: RSS Feed approach (most reliable when channel ID is known)
  async function fetchFromRSSFeed() {
    const corsProxy = "https://api.allorigins.win/get?url=";

    // Try different RSS URL formats
    const rssUrls = [];

    // If we have the channel ID, use it (most reliable)
    if (
      YOUTUBE_CONFIG.channelId &&
      YOUTUBE_CONFIG.channelId !== "YOUR_CHANNEL_ID_HERE"
    ) {
      rssUrls.push(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CONFIG.channelId}`
      );
    }

    // Try with username
    rssUrls.push(
      `https://www.youtube.com/feeds/videos.xml?user=${YOUTUBE_CONFIG.channelUsername}`
    );

    for (const rssUrl of rssUrls) {
      try {
        console.log("Trying RSS URL:", rssUrl);
        const response = await fetch(corsProxy + encodeURIComponent(rssUrl));

        if (response.ok) {
          const data = await response.json();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, "text/xml");

          // Check if we got valid XML with entries
          const entries = xmlDoc.getElementsByTagName("entry");
          if (entries.length > 0) {
            const latestEntry = entries[0];

            // Extract video information
            const videoId =
              latestEntry.getElementsByTagName("yt:videoId")[0]?.textContent;
            const title =
              latestEntry.getElementsByTagName("title")[0]?.textContent;
            const description =
              latestEntry.getElementsByTagName("media:description")[0]
                ?.textContent;
            const publishedDate =
              latestEntry.getElementsByTagName("published")[0]?.textContent;

            if (videoId && title) {
              console.log("✅ Found latest video via RSS:", title);
              updateVideoEmbed(videoId, title, description, publishedDate);
              return; // Success!
            }
          }
        }
      } catch (error) {
        console.log("RSS URL failed:", rssUrl, error);
        continue; // Try next URL
      }
    }

    throw new Error("RSS feed method failed");
  }

  // Method 2: Direct channel ID method
  async function fetchFromChannelId() {
    if (
      !YOUTUBE_CONFIG.channelId ||
      YOUTUBE_CONFIG.channelId === "YOUR_CHANNEL_ID_HERE"
    ) {
      throw new Error("Channel ID not configured");
    }

    // This would require YouTube API key, so we'll skip for now
    throw new Error("API method requires key");
  }

  // Method 3: Channel embed method (fallback)
  async function useChannelEmbedMethod() {
    console.log("Using channel embed method...");

    const videoContainer = document.querySelector(".video-container iframe");
    if (!videoContainer) {
      throw new Error("Video container not found");
    }

    // Use YouTube's channel uploads playlist embed
    let embedUrl;

    if (
      YOUTUBE_CONFIG.channelId &&
      YOUTUBE_CONFIG.channelId !== "YOUR_CHANNEL_ID_HERE"
    ) {
      // Convert channel ID to uploads playlist ID
      const uploadsPlaylistId = YOUTUBE_CONFIG.channelId.replace("UC", "UU");
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}&controls=1&rel=0`;
    } else {
      // Fallback to search method
      embedUrl = `https://www.youtube.com/embed?listType=search&list=${YOUTUBE_CONFIG.channelHandle}&controls=1&rel=0`;
    }

    videoContainer.src = embedUrl;
    videoContainer.title = `Latest Video from ${YOUTUBE_CONFIG.channelHandle}`;

    // Update the section title to indicate auto-update
    updateVideoSectionUI(
      "Latest Content (Auto-Updated)",
      `Automatically showing the latest video from ${YOUTUBE_CONFIG.channelHandle}. Content updates when new videos are published.`
    );

    console.log("✅ Updated to use channel embed method");
  }

  // Function to update the video embed with new video data
  function updateVideoEmbed(videoId, title, description, publishedDate) {
    const videoContainer = document.querySelector(".video-container iframe");
    const videoTitle = document.querySelector(".card h2");
    const videoDescription = document.querySelector(".card p");

    if (videoContainer && videoId) {
      // Update iframe source
      videoContainer.src = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
      videoContainer.title = title || "Latest YouTube Video";

      // Add loading animation
      videoContainer.style.opacity = "0";
      videoContainer.style.transform = "scale(0.95)";

      setTimeout(() => {
        videoContainer.style.transition =
          "opacity 0.5s ease, transform 0.5s ease";
        videoContainer.style.opacity = "1";
        videoContainer.style.transform = "scale(1)";
      }, 300);
    }

    console.log("✅ Latest YouTube video updated:", title);
  }

  // Initialize latest video fetch with retry mechanism
  async function initializeLatestVideo() {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await fetchLatestYouTubeVideo();
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.log(`Attempt ${retryCount} failed:`, error);

        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retryCount))
          );
        } else {
          console.log("All attempts failed, keeping current video");
        }
      }
    }
  }

  // Start fetching latest video after a short delay to ensure page is loaded
  setTimeout(initializeLatestVideo, 2000);

  // Scroll indicator
  function updateScrollIndicator() {
    const scrollIndicator = document.querySelector(".scroll-indicator");
    if (!scrollIndicator) {
      // Create scroll indicator if it doesn't exist
      const indicator = document.createElement("div");
      indicator.className = "scroll-indicator";
      document.body.appendChild(indicator);
    }

    const scrolled =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    document.querySelector(".scroll-indicator").style.transform = `scaleX(${
      scrolled / 100
    })`;
  }

  window.addEventListener("scroll", updateScrollIndicator);

  // Smooth reveal animations for cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all cards for animation
  document.querySelectorAll(".card, .profile-container").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(card);
  });

  // Enhanced form handling
  const newsletterForm = document.getElementById("newsletter-form");
  const contactForm = document.getElementById("contact-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const button = this.querySelector(".btn-subscribe");
      const originalText = button.textContent;

      button.classList.add("loading");
      button.textContent = "Subscribing...";

      // Simulate API call
      setTimeout(() => {
        button.classList.remove("loading");
        button.textContent = "Subscribed!";
        button.style.background = "rgb(76, 175, 80)";

        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = "";
          this.reset();
        }, 2000);
      }, 1500);
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const button = this.querySelector(".btn-send");
      const originalText = button.textContent;

      button.classList.add("loading");
      button.textContent = "Sending...";

      // Simulate API call
      setTimeout(() => {
        button.classList.remove("loading");
        button.textContent = "Message Sent!";
        button.style.background = "rgb(76, 175, 80)";

        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = "";
          this.reset();
        }, 2000);
      }, 1500);
    });
  }

  // Navbar scroll effect
  let lastScrollTop = 0;
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      navbar.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up
      navbar.style.transform = "translateY(0)";
    }

    // Add background blur when scrolled
    if (scrollTop > 50) {
      navbar.style.background = "rgba(26, 31, 46, 0.95)";
      navbar.style.backdropFilter = "blur(20px)";
    } else {
      navbar.style.background = "rgba(26, 31, 46, 0.8)";
      navbar.style.backdropFilter = "blur(10px)";
    }

    lastScrollTop = scrollTop;
  });

  // Add hover effects to tags
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px) scale(1.05)";
    });

    tag.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Keyboard navigation improvements
  document.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      document.body.classList.add("keyboard-navigation");
    }
  });

  document.addEventListener("mousedown", function () {
    document.body.classList.remove("keyboard-navigation");
  });

  // Performance optimization: Lazy load images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Add ripple effect to buttons
  function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }

  // Add ripple effect to buttons
  document
    .querySelectorAll(".cta-button, .btn-subscribe, .btn-send, .badge")
    .forEach((button) => {
      button.addEventListener("click", createRipple);
    });
});

// Add CSS for ripple effect and loading states
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 600ms linear;
    background-color: rgba(255, 255, 255, 0.6);
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.keyboard-navigation *:focus {
    outline: 2px solid rgb(76, 175, 80) !important;
    outline-offset: 2px !important;
}

.loading {
    position: relative;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Video loading animation */
.video-container iframe {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

/* Scroll indicator */
.scroll-indicator {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, rgb(76, 175, 80), rgb(102, 187, 106));
    transform-origin: left;
    transform: scaleX(0);
    z-index: 1001;
    transition: transform 0.1s ease-out;
}
`;

// Inject enhanced CSS
const style = document.createElement("style");
style.textContent = rippleCSS;
document.head.appendChild(style);
