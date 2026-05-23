document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blogSearchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('#blogArchiveGrid .blog-card');
  const blogGrid = document.getElementById('blogArchiveGrid');

  let activeFilter = 'all';
  let searchQuery = '';

  // Handle Search Input changes
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterPosts();
    });
  }

  // Handle Filter Button clicks
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      filterPosts();
    });
  });

  const filterPosts = () => {
    let visibleCount = 0;

    blogCards.forEach(card => {
      const title = card.querySelector('.blog-card-title').innerText.toLowerCase();
      const desc = card.querySelector('.blog-card-desc').innerText.toLowerCase();
      const cardTags = card.getAttribute('data-tags');

      // Check search match
      const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery) || cardTags.toLowerCase().includes(searchQuery);

      // Check category filter match
      const matchesFilter = activeFilter === 'all' || cardTags === activeFilter;

      if (matchesSearch && matchesFilter) {
        card.style.display = 'flex';
        // Trigger small entry animation
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Check if we have matching posts
    let noResultsMsg = document.getElementById('noResultsMessage');

    if (visibleCount === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'noResultsMessage';
        noResultsMsg.style.fontFamily = 'var(--font-mono)';
        noResultsMsg.style.color = 'var(--text-muted)';
        noResultsMsg.style.padding = '4rem 0';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.width = '100%';
        noResultsMsg.innerHTML = '[-] ERROR: No matching publication nodes identified.<br><span style="font-size:0.85rem">Try refining your keyword query filters.</span>';
        blogGrid.appendChild(noResultsMsg);
      }
    } else {
      if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
  };
});
