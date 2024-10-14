function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function paginateTable(table, pageSize, currentPage) {
  const rows = [...table.querySelectorAll('tbody tr')];
  const totalPages = Math.ceil(rows.length / pageSize);
  rows.forEach((row, index) => {
      row.style.display = (index >= (currentPage - 1) * pageSize && index < currentPage * pageSize) ? '' : 'none';
  });
  return totalPages;
}

function createPaginationControls(table, totalPages, currentPage) {
  const paginationWrapper = document.createElement('div');
  paginationWrapper.classList.add('pagination-controls');
  for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.innerText = i;
      pageButton.addEventListener('click', () => {
          paginateTable(table, 2, i);
          updateActivePage(paginationWrapper, i);
      });
      if (i === currentPage) {
          pageButton.classList.add('active');
      }
      paginationWrapper.appendChild(pageButton);
  }
  return paginationWrapper;
}

function updateActivePage(paginationWrapper, newPage) {
  paginationWrapper.querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('active', index === newPage - 1);
  });
}

function applyFilter(table, query, paginationControls) {
  const rows = [...table.querySelectorAll('tbody tr')];
  if (query === '') {
      // If the filter is empty, reset pagination
      rows.forEach(row => row.style.display = '');
      const totalPages = paginateTable(table, 2, 1);
      updatePaginationControls(paginationControls, totalPages, 1);
  } else {
      // Apply filtering
      rows.forEach(row => {
          const cells = [...row.querySelectorAll('td')];
          const matches = cells.some(cell => cell.textContent.toLowerCase().includes(query.toLowerCase()));
          row.style.display = matches ? '' : 'none';
      });
  }
}

function updatePaginationControls(paginationWrapper, totalPages, currentPage) {
  paginationWrapper.innerHTML = ''; // Clear existing buttons
  for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.innerText = i;
      pageButton.addEventListener('click', () => {
          paginateTable(paginationWrapper.parentNode.querySelector('table'), 2, i);
          updateActivePage(paginationWrapper, i);
      });
      if (i === currentPage) {
          pageButton.classList.add('active');
      }
      paginationWrapper.appendChild(pageButton);
  }
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child, i) => {
      const row = document.createElement('tr');
      if (header && i === 0) thead.append(row);
      else tbody.append(row);
      [...child.children].forEach((col) => {
          const cell = buildCell(header ? i : i + 1);
          cell.innerHTML = col.innerHTML;
          row.append(cell);
      });
  });

  block.innerHTML = '';
  block.append(table);

  // Create a search input for filtering
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.placeholder = 'Filter table...';
  
  // Pagination logic
  const pageSize = 2;
  const currentPage = 1;
  const totalPages = paginateTable(table, pageSize, currentPage);

  // Append pagination controls
  const paginationControls = createPaginationControls(table, totalPages, currentPage);

  // Add event listener for filtering
  filterInput.addEventListener('input', (e) => applyFilter(table, e.target.value, paginationControls));

  block.prepend(filterInput);
  block.append(paginationControls);
}
