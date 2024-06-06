document.addEventListener("DOMContentLoaded", () => {
  const tables = document.querySelectorAll("table.full-width-table");

  // Fetch product data from the server
  fetch("/products", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        const products = result.products;

        tables.forEach((table) => {
          const brand = table
            .closest("section")
            .querySelector("h2")
            .textContent.trim();
          populateTable(table, products, brand);
        });
      } else {
        alert(result.message);
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      alert("An error occurred while fetching products.");
    });

  function populateTable(table, products, brand) {
    const tbody = table.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach((row) => {
      const size = row.querySelector("th").textContent.trim();
      const cells = row.querySelectorAll("td");

      cells.forEach((cell, index) => {
        const thickness = table
          .querySelector(`thead tr:nth-of-type(2) th:nth-of-type(${index + 2})`)
          .textContent.trim();
        const product = products.find(
          (p) =>
            p.brand === brand && p.size === size && p.thickness === thickness
        );

        cell.textContent = product ? product.quantity : 0;
      });
    });
  }
});
