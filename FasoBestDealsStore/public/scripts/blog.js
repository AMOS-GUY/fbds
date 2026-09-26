import { blogPosts } from "../../data/blog-container.js";
//import { renderBlogs } from "./utils/general-fx.js";
// --------------------------------------------------------------
      //  BLOG POSTS ARRAY (central data source)
      //  You only need to edit or maintain this array.
      //  Each object follows the schema below.
      //  Fields: id, title, excerpt, date, category, imageBg, fullContent
      //  - imageBg: any CSS gradient or solid color (used as background + overlay)
      //  - The actual background image uses a subtle texture/unsplash fallback,
      //    but you can override easily. For clarity, we use gradient dominant + overlay.
      //  - To add new posts, simply push a new object into this array.
      // --------------------------------------------------------------

      // Helper: render all blog cards dynamically from the blogPosts array.
      // This function handles grid injection, card creation, modal binding.
      export function renderBlogs() {
        const blogGrid = document.getElementById("blogGrid");
        if (!blogGrid) return;

        // clear grid but preserve possible empty state
        blogGrid.innerHTML = "";

        if (!blogPosts.length) {
          blogGrid.innerHTML = `<div class="empty-blog"><i class="fas fa-journal-whills"></i> <h3>No blog posts yet</h3><p>Check back soon for fresh stories.</p></div>`;
          return;
        }

        // iterate over the array and build each card
        blogPosts.forEach((post) => {
          const card = document.createElement("div");
          card.className = "blog-card";

          // Image div with gradient background + a subtle unsplash placeholder as texture overlay.
          // We use a high-quality transparent-friendly image? To maintain cleanliness we keep a
          // subtle evergreen image (soft abstract) that blends with gradient. It's not intrusive.
          // The background property: we use the post.imageBg as the gradient, then a soft texture image.
          // For maximum style, we use a subtle noise-like image from unsplash (light & airy)
          // to give depth, but not distracting. This matches the original intent: "url(...)" fallback.
          // If you prefer to remove the external image, just set background to post.imageBg only.
          // But to preserve the original design pattern and make it clean, we embed a soft
          // atmospheric image that blends elegantly.
          const imgDiv = document.createElement("div");
          imgDiv.className = "blog-img";
          // Using a minimal, high-quality background image from unsplash (soft abstract grain)
          // It blends perfectly with overlay blending mode -> gives subtle texture without stealing focus.
          const baseTexture =
            `../media/${post.picture}`; // soft studio abstract
          // The blend with gradient and image makes it unique. But to ensure clean, I add it.
          imgDiv.style.background = `${post.imageBg}, url(${baseTexture})`;
          imgDiv.style.backgroundSize = "cover";
          imgDiv.style.backgroundBlendMode = "overlay";
          imgDiv.style.backgroundPosition = "center";

          const contentDiv = document.createElement("div");
          contentDiv.className = "blog-content";
          contentDiv.innerHTML = `
        <div class="blog-meta">
          <span><i class="far fa-calendar-alt"></i> ${escapeHtml(post.date)}</span>
          <span><i class="fas fa-tag"></i> ${escapeHtml(post.category)}</span>
        </div>
        <div class="blog-title">${escapeHtml(post.title)}</div>
        <div class="blog-excerpt">${escapeHtml(post.excerpt)}</div>
        <a href="#" class="read-more" data-id="${post.id}">Read more <i class="fas fa-arrow-right"></i></a>
      `;
          card.appendChild(imgDiv);
          card.appendChild(contentDiv);
          blogGrid.appendChild(card);
        });

        // attach modal event listeners to all read-more links
        attachModalListeners();
      }

      // helper to prevent XSS (safe text)
      function escapeHtml(str) {
        if (!str) return "";
        return str
          .replace(/[&<>]/g, function (m) {
            if (m === "&") return "&amp;";
            if (m === "<") return "&lt;";
            if (m === ">") return "&gt;";
            return m;
          })
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
            return c;
          });
      }

      // modal logic: open modal with full blog content, show meta info
      function attachModalListeners() {
        const modal = document.getElementById("blogModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalDesc = document.getElementById("modalDesc");
        const modalMeta = document.getElementById("modalMeta");
        const closeBtn = document.getElementById("closeModalBtn");

        if (!modal) return;

        // close modal handler (click outside or close button)
        const closeModal = () => {
          modal.style.display = "none";
        };
        if (closeBtn) closeBtn.onclick = closeModal;
        window.onclick = (e) => {
          if (e.target === modal) closeModal();
        };

        // attach event to each read-more link (re-attach after each render)
        document.querySelectorAll(".read-more").forEach((link) => {
          // remove previous listeners to avoid duplicates
          const newLink = link.cloneNode(true);
          link.parentNode.replaceChild(newLink, link);
          newLink.addEventListener("click", (e) => {
            e.preventDefault();
            const id = parseInt(newLink.getAttribute("data-id"));
            const post = blogPosts.find((p) => p.id === id);
            if (post) {
              modalTitle.innerText = post.title;
              modalDesc.innerText =
                post.fullContent || "Full content coming soon...";
              // show meta in modal: date + category
              modalMeta.innerHTML = `
            <span><i class="far fa-calendar-alt"></i> ${escapeHtml(post.date)}</span>
            <span><i class="fas fa-tag"></i> ${escapeHtml(post.category)}</span>
          `;
              modal.style.display = "flex";
            } else {
              console.warn("Post not found for id", id);
            }
          });
        });
      }

      // optional: if you want to easily extend or add new blog posts from external, just modify blogPosts array and re-run renderBlogs
      // For demonstration, I also add a function that you can use to dynamically add new posts without touching HTML.
      window.addBlogPost = function (newPost) {
        if (!newPost.id || !newPost.title) return false;
        blogPosts.push(newPost);
        renderBlogs();
        return true;
      };

      // initial render
      renderBlogs();

      // small console info: show how to add more posts dynamically (developer-friendly)
      console.log(
        "✅ Blog system ready. To add new posts, push to blogPosts array and call renderBlogs()",
      );
      console.log(
        "Example: addBlogPost({ id: 6, title: 'New trend', excerpt: '...', date: 'April 10, 2025', category: 'Inspiration', imageBg: 'linear-gradient(125deg, #d4af7a, #b38b40)', fullContent: 'Detailed insights...' })",
      );