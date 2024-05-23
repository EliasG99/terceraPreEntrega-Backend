// Imports

import {Router} from 'express';
import { CartsController } from '../dao/controllers/cart.controller.js';

// Definitions

export const router = Router();

// Methods

router.get('/', CartsController.getCarts) // Get the complete list of carts
router.get('/:cid', CartsController.getCartById) // Get a cart by its ID
router.post('/:cid/product/:pid', CartsController.addProductToCart) // Adds a product to a cart by its ID
router.post('/', CartsController.createCart) // Creates a new cart with products, the products are sent via Body
router.delete('/:cid/product/:pid', CartsController.deleteProductInCart) // Deletes a product in a cart by its ID
//TODO Decrease stock of the product
router.delete('/:cid', CartsController.deleteProductsInCart) // Deletes all the products form a cart
//TODO Decrease stock of the product

router.put('/:cid', CartsController.updateCart) // Updates the entire cart with the products sent via body
//TODO Decrease stock of the product

router.put('/:cid/product/:pid', CartsController.updateQuantityInCart) // Updates the quantity sent via body of a product from a cart 

//TODO Decrease stock of the product

/* router.delete('/:cid', async (req, res) => { // Deletes an entire cart by its ID
  res.setHeader('Content-Type', 'application/json'); 
  let cartId = req.params.cid; // Extract the cartId from the request parameters
  if (!cartId) { // The cartID Must be the MongoDB id
    return res.status(400).json({error: 'Please provide a valid cart ID'});
  }
  let result = await cartManager.deleteCart(cartId);
  if (result) {
    // Successfully deleted the cart
    res.status(200).json({status: 'success', message: 'Cart deleted successfully'});
  } else {
    // Failed to delete the cart (either not found or some other error)
    res.status(400).json({error: 'The cart could not be found or deleted'});
  }
}); */