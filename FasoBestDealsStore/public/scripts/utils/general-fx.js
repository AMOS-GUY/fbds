import { blogPosts } from "../../../data/blog-container";
export function renderBlogs() {
  const blogGrid = document.getElementById("blogGrid");
  if (!blogGrid) return;
  blogGrid.innerHTML = "";
  blogPosts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "blog-card";
    // image div with gradient background instead of external placeholder to keep it clean
    const imgDiv = document.createElement("div");
    imgDiv.className = "blog-img";
    imgDiv.style.background =
      post.imageBg +
      ", url(../../media/sreeja-p0kzFn1BGOk-unsplash.jpg)";
    imgDiv.style.backgroundSize = "cover";
    imgDiv.style.backgroundBlend = "overlay";
    const contentDiv = document.createElement("div");
    contentDiv.className = "blog-content";
    contentDiv.innerHTML = `
      <div class="blog-meta"><span><i class="far fa-calendar-alt"></i> ${post.date}</span> <span><i class="fas fa-tag"></i> ${post.category}</span></div>
      <div class="blog-title">${post.title}</div>
      <div class="blog-excerpt">${post.excerpt}</div>
      <a href="#" class="read-more" data-id="${post.id}">Read more <i class="fas fa-arrow-right"></i></a>
    `;
    card.appendChild(imgDiv);
    card.appendChild(contentDiv);
    blogGrid.appendChild(card);
  });

  // attach event listeners to all read-more links after DOM update
  document.querySelectorAll(".read-more").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = parseInt(link.getAttribute("data-id"));
      const post = blogPosts.find((p) => p.id === id);
      if (post) {
        const modal = document.getElementById("blogModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalDesc = document.getElementById("modalDesc");
        modalTitle.innerText = post.title;
        modalDesc.innerText = post.fullContent;
        modal.style.display = "flex";
      }
    });
  });
}
