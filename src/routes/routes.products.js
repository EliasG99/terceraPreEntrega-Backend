// Imports

import {Router} from 'express';
import { ProductsController } from '../dao/controllers/product.controller.js';

// Definitions

export const router = Router();

// Methods

router.get('/', ProductsController.getProducts);

router.get('/:id', ProductsController.getProductById); // Get a product by its ID

router.delete('/:id', ProductsController.deleteProduct) // Delete a product by its ID
  
router.put('/:id', ProductsController.modifyProduct) // Update a product by its ID
  
router.post('/', ProductsController.addProduct) // Add a new product