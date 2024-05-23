import ProductManagerMongo from "../ProductManagerMongo.js";
import { io } from '../../app.js';

let productManager = new ProductManagerMongo();

export class ProductsController {
  constructor() {}

  static async getProducts(req, res) {
    res.setHeader("Content-Type", "application/json"); // Set the header
    let { limit = 10, page = 1, category, sort = {} } = req.query; // Get the queries, if they are not provided, set some default values
    let sortOption = {}; // Set the sorting, it can be ascending or descending
    let query = {};
    if (category) {
      query.description = { $regex: category, $options: "i" }; // Regular expression so that it can accept upper and lowecase text
    }
    if (sort === "asc") {
      sortOption = { price: 1 };
    } else if (sort === "desc") {
      sortOption = { price: -1 };
    } else {
      console.log("The sort option can be asc or desc");
    }
    console.log(
      `Queries received in products router LIMIT: ${limit}, PAGE: ${page}, QUERY: ${category}, SORT: ${sort}`
    );
    limit = parseInt(limit); // Get the limit query for products
    page = parseInt(page);
    let products = await productManager.getProducts(
      limit,
      page,
      query,
      sortOption
    ); // Fetches the paginate data of all products
    let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } = products; // Destructure the data from paginate
    let prevLink = "",
      nextLink = "";
    if (hasPrevPage) {
      prevLink = `localhost:3000/api/products?limit=${limit}&page=${prevPage}`;
    } else {
      prevLink = null;
    }
    if (hasNextPage) {
      nextLink = `localhost:3000/api/products?limit=${limit}&page=${nextPage}`;
    } else {
      nextLink = null;
    }
    if (!products) {
      res
        .status(400)
        .json({ error: "The products could not be fetched from the DB" });
    } else {
      res.status(200).json({
        status: "sucess",
        payload: products.docs,
        totalPages,
        hasNextPage,
        hasPrevPage,
        prevPage,
        nextPage,
        prevLink,
        nextLink,
      });
    }
  }

  static async getProductById(req, res) {
    res.setHeader('Content-Type', 'application/json'); // Set the header
    let id = req.params.id; // Must be Product ID from MongoDB
    console.log('EL ID EN GETPRODUCTS ES: ', id)
    if (!id) {
      return res.status(400).json({error: 'The ID you entered is not a valid number'});
    }
    let result = await productManager.getProductById(id);
    if (!result) {
      res.status(400).json({error: 'The product couldnot be found'});
    } else {
      res.status(200).json({ result });
    }
  }

  static async deleteProduct(req, res) {
    res.setHeader('Content-Type', 'application/json'); // Set the header
    let id = req.params.id; // Must be Product ID from MongoDB
    if (!id) {
      return res.status(404).json({error: 'The ID you entered is not a valid number'});
    }
    let result = await productManager.deleteProduct(id);
    let updatedProducts = await productManager.getProducts();
    io.emit('newProduct', updatedProducts.docs);
    if (!result) {
      res.status(400).json({error: 'The product could not be found'});
    } else {
      res.status(200).json({status:'success', message:'Product removed successfully'})
    }
  }

  static async modifyProduct(req, res) {
    res.setHeader('Content-Type', 'application/json'); // Set the header
    let product = req.body // Get the information to be updated
    let id = req.params.id; // Must be Product ID from MongoDB
    if (!id) {
      return res.status(400).json({error: 'The ID you entered is not a valid number'});
    }
    let result = await productManager.updateProduct(id, product); // Update the product
    let updatedProducts = await productManager.getProducts(); // Get the list of products again to display it via websockets
    io.emit('newProduct', updatedProducts.docs);
    if (!result) {
      res.status(404).json({error: 'The product could not be found'});
    } else {
      res.status(200).json({status:'success', message:'Product updated successfully'})
    }
  }

  static async addProduct(req, res){
    res.setHeader('Content-Type', 'application/json'); // Set the header
    let product = req.body;
    console.log(product)
    if (!product.title || !product.description || !product.price || !product.code || !product.stock) {
      return res.status(400).json({status: 'error', error: 'Incomplete data, make sure to enter all required fields'})
    } 
    try {
      await productManager.addProduct(product) // Send the product and destructure it in the target function
      let updatedProducts = await productManager.getProducts();
      io.emit('newProduct', updatedProducts.docs);
      res.status(200).json({ status: 'success', message:'Product added successfully' });
    } catch (error) {
      res.status(400).json({status:'error', message: error.message});
    }
  }

}
