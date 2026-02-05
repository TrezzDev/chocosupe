/**
 * Pagination Component
 */

export function createPagination(currentPage, hasNextPage, onPageChange, totalPages = null) {
  const container = document.createElement('div');
  container.className = 'pagination';
  container.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
    padding: 20px;
  `;

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary';
  prevBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    Previous
  `;
  prevBtn.disabled = currentPage <= 1;
  prevBtn.onclick = () => onPageChange(currentPage - 1);
  
  // Page info
  const pageInfo = document.createElement('span');
  pageInfo.style.cssText = `
    color: var(--text-secondary);
    font-weight: 500;
    min-width: 100px;
    text-align: center;
  `;
  pageInfo.textContent = totalPages 
    ? `Page ${currentPage} of ${totalPages}`
    : `Page ${currentPage}`;

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-secondary';
  nextBtn.innerHTML = `
    Next
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;
  nextBtn.disabled = !hasNextPage;
  nextBtn.onclick = () => onPageChange(currentPage + 1);

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);

  return container;
}