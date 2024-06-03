document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem("token", result.token); // Store the token in local storage
          window.location.href = "home.html";
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Error during login:", error);
      }
    });
  } else {
    const doorList = document.getElementById("door-list");
    const plywoodList = document.getElementById("plywood-list");

    const addDoorNameInput = document.getElementById("add-door-name");
    const addDoorSizeInput = document.getElementById("add-door-size");
    const addDoorThicknessInput = document.getElementById("add-door-thickness");
    const addDoorQuantityInput = document.getElementById("add-door-quantity");
    const addPlywoodNameInput = document.getElementById("add-plywood-name");
    const addPlywoodSizeInput = document.getElementById("add-plywood-size");
    const addPlywoodThicknessInput = document.getElementById(
      "add-plywood-thickness"
    );
    const addPlywoodQuantityInput = document.getElementById(
      "add-plywood-quantity"
    );

    const addDoorBtn = document.getElementById("add-door-btn");
    const addPlywoodBtn = document.getElementById("add-plywood-btn");

    addDoorBtn.addEventListener("click", () => {
      const name = addDoorNameInput.value;
      const size = addDoorSizeInput.value;
      const thickness = addDoorThicknessInput.value;
      const quantity = parseInt(addDoorQuantityInput.value);

      if (name && size && thickness && quantity > 0) {
        addProduct("door", name, size, thickness, quantity);
        addDoorNameInput.value = "";
        addDoorSizeInput.value = "";
        addDoorThicknessInput.value = "";
        addDoorQuantityInput.value = "";
      } else {
        alert("Please enter valid name, size, thickness, and quantity.");
      }
    });

    addPlywoodBtn.addEventListener("click", () => {
      const name = addPlywoodNameInput.value;
      const size = addPlywoodSizeInput.value;
      const thickness = addPlywoodThicknessInput.value;
      const quantity = parseInt(addPlywoodQuantityInput.value);

      if (name && size && thickness && quantity > 0) {
        addProduct("plywood", name, size, thickness, quantity);
        addPlywoodNameInput.value = "";
        addPlywoodSizeInput.value = "";
        addPlywoodThicknessInput.value = "";
        addPlywoodQuantityInput.value = "";
      } else {
        alert("Please enter valid name, size, thickness, and quantity.");
      }
    });

    function addProduct(type, name, size, thickness, quantity) {
      fetch("/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Attach the token to the request headers
        },
        body: JSON.stringify({ type, name, size, thickness, quantity }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            // If product added successfully, create and append product card
            let productId = result.product._id; // Use the actual product ID from the server response
            const productList = type === "door" ? doorList : plywoodList;
            const productCard = createProductCard(
              name,
              size,
              thickness,
              quantity,
              productId
            );
            productList.appendChild(productCard);
          } else {
            // If there's an error, show error message
            alert(result.message);
          }
        })
        .catch((error) => {
          console.error("Error adding product:", error);
          alert("An error occurred while adding the product.");
        });
    }

    async function editProduct(card, productId) {
      const newName = prompt("Enter the new name:");
      const newSize = prompt("Enter the new size:");
      const newThickness = prompt("Enter the new thickness:");
      const newQuantity = parseInt(prompt("Enter the new quantity:"));

      if (newName && newSize && newThickness && newQuantity > 0) {
        try {
          const response = await fetch(`/products/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: newName,
              size: newSize,
              thickness: newThickness,
              quantity: newQuantity,
            }),
          });

          if (!response.ok) {
            throw new Error("Error updating product");
          }

          const result = await response.json();

          if (!result.success) {
            console.error("Error updating product:", result.message);
            alert("Updated Successfully");
          } else {
            // Update the card with the new information
            const title = card.querySelector("h3");
            const sizeInfo = card.querySelector("p:nth-of-type(2)");
            const thicknessInfo = card.querySelector("p:nth-of-type(3)");
            const quantityValue = card.querySelector(".quantity-value");

            title.textContent = newName;
            sizeInfo.textContent = `Size: ${newSize}`;
            thicknessInfo.textContent = `Thickness: ${newThickness}`;
            quantityValue.textContent = newQuantity;
          }
        } catch (error) {
          console.error("Error updating product:", error);
          alert("Updated Successfully");
        }
      } else {
        alert(
          "Please enter valid values for name, size, thickness, and quantity."
        );
      }
    }

    function editQuantity(productId) {
      const newQuantity = prompt("Enter the new quantity:");
      const quantityElement = document.querySelector(
        `.product-card[data-product-id="${productId}"] .quantity-value`
      );

      if (
        newQuantity !== null &&
        !isNaN(newQuantity) &&
        parseInt(newQuantity) >= 0
      ) {
        quantityElement.textContent = newQuantity;
        updateProductQuantityOnServer(productId, parseInt(newQuantity));
      } else if (newQuantity !== null) {
        alert("Please enter a valid non-negative number for the quantity.");
      }
    }

    async function deleteProduct(card, productId) {
      try {
        const response = await fetch(`/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error deleting product");
        }

        // Remove the card from the UI
        card.remove();
        alert("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred while deleting the product.");
      }
    }

    function createProductCard(name, size, thickness, quantity, productId) {
      const card = document.createElement("li");
      card.classList.add("product-card");
      card.dataset.productId = productId;

      const title = document.createElement("h3");
      title.textContent = name;
      card.appendChild(title);

      const sizeInfo = document.createElement("p");
      sizeInfo.textContent = `Size: ${size}`;
      card.appendChild(sizeInfo);

      const thicknessInfo = document.createElement("p");
      thicknessInfo.textContent = `Thickness: ${thickness}`;
      card.appendChild(thicknessInfo);

      const quantityInfo = document.createElement("div");
      quantityInfo.classList.add("quantity-control");

      const quantityLabel = document.createElement("span");
      quantityLabel.textContent = `Quantity: `;
      quantityInfo.appendChild(quantityLabel);

      const quantityValue = document.createElement("span");
      quantityValue.textContent = quantity;
      quantityValue.classList.add("quantity-value");
      quantityInfo.appendChild(quantityValue);

      const decreaseBtn = document.createElement("button");
      decreaseBtn.textContent = "-";
      decreaseBtn.addEventListener("click", () =>
        updateQuantity(quantityValue, -1, productId)
      );
      quantityInfo.appendChild(decreaseBtn);

      const increaseBtn = document.createElement("button");
      increaseBtn.textContent = "+";
      increaseBtn.addEventListener("click", () =>
        updateQuantity(quantityValue, 1, productId)
      );
      quantityInfo.appendChild(increaseBtn);

      const editQuanBtn = document.createElement("button");
      editQuanBtn.textContent = "Edit Quan";
      editQuanBtn.style.width = "auto";
      editQuanBtn.style.borderRadius = "10px";
      editQuanBtn.style.backgroundColor = "green";
      editQuanBtn.style.color = "white";
      editQuanBtn.addEventListener("click", () => {
        editQuantity(productId);
      });
      quantityInfo.appendChild(editQuanBtn);

      card.appendChild(quantityInfo);

      const actions = document.createElement("div");
      actions.classList.add("actions");

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.borderRadius = "10px";
      editBtn.style.backgroundColor = "blue";
      editBtn.addEventListener("click", () => {
        editProduct(card, productId);
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.borderRadius = "10px";
      deleteBtn.style.backgroundColor = "red";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this item?")) {
          deleteProduct(card, productId);
        }
      });
      actions.appendChild(deleteBtn);

      card.appendChild(actions);

      return card;
    }

    async function updateQuantity(quantityElement, change, productId) {
      let currentQuantity = parseInt(quantityElement.textContent);
      let newQuantity = currentQuantity + change;
      if (newQuantity >= 0) {
        quantityElement.textContent = newQuantity;

        // Fetch request to update the quantity on the server
        updateProductQuantityOnServer(productId, newQuantity);
      } else {
        alert("Quantity cannot be negative.");
      }
    }

    async function updateProductQuantityOnServer(productId, quantity) {
      try {
        const response = await fetch(`/products/${productId}/quantity`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
          throw new Error("Error updating product quantity");
        }

        const result = await response.json();

        if (!result.success) {
          console.error("Error updating product quantity:", result.message);
          alert("An error occurred while updating product quantity.");
        }
      } catch (error) {
        console.error("Error updating product quantity:", error);
        alert("An error occurred while updating product quantity.");
      }
    }

    fetch(`/products`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          result.products.forEach((product) => {
            const productList =
              product.type === "door" ? doorList : plywoodList;
            const productCard = createProductCard(
              product.name,
              product.size,
              product.thickness,
              product.quantity,
              product._id
            );
            productList.appendChild(productCard);
          });
        } else {
          alert(result.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        alert("An error occurred while fetching products.");
      });
  }
});
