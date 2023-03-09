import { Router } from "express";
import multer from "multer";

import uploadConfig from "./configs/multer";
const upload = multer(uploadConfig);

import {
  createAccessLevel,
  getAllAccessLevel,
} from "./controllers/AccessLevelController";
import {
  createAddress,
  deleteAddress,
  getAddress,
  updateAddress,
} from "./controllers/AddressController";
import { signIn } from "./controllers/AuthController";
import {
  createProduct,
  getAllProducts,
  getAllProductsStore,
  getUniqueProducts,
} from "./controllers/ProductController";
import {
  getAllSaleByOwner,
  getAllSaleByUserId,
  getAllSales,
  getDetailsSaleByUserId,
  performSale,
} from "./controllers/SaleController";
import {
  createStore,
  deleteStore,
  getAllStore,
  getAllStoreByOwner,
  getUniqueStoreByOwner,
} from "./controllers/StoreController";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUniqueUser,
  updateUser,
} from "./controllers/UserController";
import { authMiddleware } from "./middlewares/authMiddleware";

export const router = Router();

//rotas de nível de acesso
router.post("/access-level", authMiddleware(["adm"]), createAccessLevel);
router.get("/access-level", authMiddleware(["adm"]), getAllAccessLevel);

//rotas do usuário
router.post("/user", createUser);
router.delete(
  "/delete-user",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  deleteUser
);
router.get("/user", authMiddleware(["adm"]), getAllUsers);
router.put(
  "/update-user",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  updateUser
);
router.get(
  "/unique-user",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getUniqueUser
);

//rotas de endereços
router.post(
  "/create-address",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  createAddress
);
router.get(
  "/get-address",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getAddress
);
router.put(
  "/update-address/:addressId",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  updateAddress
);
router.delete(
  "/delete-address/:addressId",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  deleteAddress
);

//rotas de autenticação
router.post("/sign-in", signIn);

// rotas da loja
router.post("/store", authMiddleware(["adm", "Vendedor"]), createStore);
router.get(
  "/stores",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getAllStore
);
router.get(
  "/get-all-store-by-owner",
  authMiddleware(["adm", "Vendedor"]),
  getAllStoreByOwner
);
router.get(
  "/get-unique-store-by-owner/:storeId",
  authMiddleware(["adm", "Vendedor"]),
  getUniqueStoreByOwner
);

router.get(
  "/delete-store/:storeId",
  authMiddleware(["adm", "Vendedor"]),
  deleteStore
);

//rotas do produto
router.post(
  "/create-product/:storeId",
  authMiddleware(["adm", "Vendedor"]),
  upload.single("image"),
  createProduct
);
router.get(
  "/get-all-product",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getAllProducts
);
router.get(
  "/get-all-product/store/:storeId",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getAllProductsStore
);
router.get(
  "/get-unique-product/:productId",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getUniqueProducts
);

//rotas das vendas

/**
 * Comprador realiza uma compra.
 */
router.post("/create-sale", authMiddleware(["adm", "Comprador"]), performSale);

/**
 * Retorna todas as vendas realizadas
 */
router.get("/get-all-sale", authMiddleware(["adm", "Vendedor"]), getAllSales);

/**
 * Comprador buscas os detalhes de uma compra feita por ele.
 */
router.get(
  "/get-details-sale-by-user/:saleId",
  authMiddleware(["adm", "Vendedor", "Comprador"]),
  getDetailsSaleByUserId
);

/**
 * Comprador busca todas as compra que ele realizou.
 */
router.get(
  "/get-all-sale-by-user",
  authMiddleware(["adm", "Comprador"]),
  getAllSaleByUserId
);

/**
 * Retorna todos os pedidos feitos ao vendedor
 */
router.get(
  "/get-all-sale-by-owner",
  authMiddleware(["adm", "Vendedor"]),
  getAllSaleByOwner
);
