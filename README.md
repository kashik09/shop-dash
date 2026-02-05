# Lab: Product Dashboard Manager

## Introduction

Your company is developing an **e-commerce platform**, and you have been assigned to create a **Product Dashboard**. This dashboard will dynamically display a list of products, allow users to filter products by availability, and apply **conditional rendering** to display different UI states.

Your goal is to structure the React components, apply styles using **CSS Modules and Material UI**, and ensure that the dashboard passes all pre-written automated tests using **Jest and React Testing Library**.

---

## **Challenge**
1. Update Existing Element of the title
2. Create New Elements for each product

## **Bonus Challenge**
3. Delete Element

---

## **Instructions**

### **1️⃣ Fork and Clone the Repository**  
1. Go to the provided **GitHub repository link**.
2. **Fork** the repository to your GitHub account.
3. **Clone** the forked repository to your local machine:
   ```sh
   git clone <your-forked-repository-url>
   cd product-dashboard
   ```
4. Open the project in **VSCode**.
5. Run the following command to install all necessary dependencies:
   ```sh
   npm install
   ```

### **2️⃣ Update Existing Element**
- Modify the existing **header** element to display the **Product Dashboard title**.
- Select the **DOM element** with the ID of `header`.
- Store it in a variable called `dashboardTitle`.
- Change the **textContent** of `dashboardTitle` to **"Product Dashboard"**.

### **3️⃣ Create New Elements for Each Product**
- Loop through every product in the dataset.
- Each product is stored in an **array**.
- Inside the loop, create and configure the following **new elements**:
  - **`div` element (`productContainer`)** to hold product details.
  - **`h3` element (`productTitle`)** to display the product name.
  - **`p` element (`productPrice`)** to show the product's price.
  - **`p` element (`productAvailability`)** to indicate if the product is **in stock or out of stock**.
  - **`img` element (`productImage`)** to display the product image.

### **4️⃣ Append Elements to the DOM**
- Select the element with the ID `product-list` and store it in a variable called `productList`.
- Append `productTitle`, `productPrice`, `productAvailability`, and `productImage` to `productContainer`.
- Append `productContainer` to `productList`.

### **5️⃣ Implement Conditional Rendering**
- Products that are **out of stock** should be **styled differently**.
- Use **CSS Modules** to apply a different background color to out-of-stock items.

---

## **Bonus Challenge: Delete Element**
- Implement a feature that allows users to **remove a product** from the dashboard.
- Add a **"Remove" button** next to each product.
- When clicked, the button should **delete the product element** from the page.

---

## **BONUS: Remove Elements from the DOM**

We know how to add elements and change their attributes. What if we want to
remove an element from a page?

### `removeChild()`

We use `removeChild()`, as you might guess, to remove a particular child of an
element:

```js
someElement.removeChild(someChildElement);
```

Let's take a look at a more complex example:

```js
const productList = document.getElementById("product-list");
const firstProduct = productList.querySelector("div:first-child");
productList.removeChild(firstProduct);
```

Here you can see the power of `querySelector()`: we can use it to find the
first product in the list. We then pass that element as the argument to our
`removeChild` method, which removes it from the dashboard.

What if we want to remove the entire product list?

### `element.remove()`

We can just call `remove()` on the element itself:

```js
productList.remove();
```

And it's gone!

---

## **Resources**

- [React Documentation](https://react.dev)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Material UI Documentation](https://mui.com)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com)
- [document.createElement()](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
- [append()](https://developer.mozilla.org/en-US/docs/Web/API/Element/append)
- [removeChild()](https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild)
- [element.remove()](https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove)
