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
} from "./controllers/AddressController";
import { signIn } from "./controllers/AuthController";
import {
  createProduct,
  getAllProducts,
  getAllProductsStore,
  getUniqueProducts,
} from "./controllers/ProductController";
import {
  getAllSaleByUserId,
  getAllSales,
  performSale,
} from "./controllers/SaleController";
import { createStore, getAllStore } from "./controllers/StoreController";
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
router.post("/create-sale", authMiddleware(["adm", "Comprador"]), performSale);
router.get("/get-all-sale", authMiddleware(["adm", "Vendedor"]), getAllSales);
router.get(
  "/get-all-sale-by-user",
  authMiddleware(["adm", "Comprador"]),
  getAllSaleByUserId
);
