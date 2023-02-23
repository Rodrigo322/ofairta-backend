import { GetSignedUrlConfig } from "@google-cloud/storage";
import { Request, Response } from "express";

import { prisma } from "../database/prisma";
import { storage } from "../firebase";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, quantity } = req.body;
    const { storeId } = req.params;
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "usuario não encontado" });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return res.status(400).json({ message: "Banca não encontrada" });
    }

    if (user.id !== store?.userId) {
      return res
        .status(400)
        .json({ message: "Usuário não é dono desta banca" });
    }

    const requestImage = req.file as Express.Multer.File;

    if (!requestImage) {
      return res
        .status(400)
        .json({ message: "Nenhum arquivo de imagem enviado." });
    }

    const bucket = storage.bucket();

    const fileRef = bucket.file(requestImage.originalname);
    const fileStream = fileRef.createWriteStream({
      metadata: {
        contentType: requestImage.mimetype,
      },
    });

    fileStream.on("error", (error) => {
      console.error(error);
      res.status(500).json("Não foi possível carregar a imagem.");
    });

    fileStream.on("finish", () => {
      res.status(200).json("Imagem enviada com sucesso.");
    });

    fileStream.end(requestImage.buffer);

    const config: GetSignedUrlConfig = {
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const [url] = await fileRef.getSignedUrl(config);

    console.log("File available at", url);

    const createProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        quantity: Number(quantity),
        image: url,
        store: {
          connect: {
            id: storeId,
          },
        },
      },
    });

    return res.status(200).json(createProduct);
  } catch (error) {
    return res.status(500).json({ error, message: "aconteceu um erro" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findMany({
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    if (product.length < 0) {
      return res.status(204).json({ message: "Nenhum produto foi encontrado" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const getAllProductsStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;

    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        store: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (products.length < 0) {
      return res.status(204).json({ message: "Nenhum produto foi encontrado" });
    }

    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const deleteManyProducts = async (req: Request, res: Response) => {
  try {
    await prisma.product.deleteMany();

    return res.status(204);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const getUniqueProducts = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        image: true,
        price: true,
        store: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(400).json({ message: "Produto não encontrado!0" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json(error);
  }
};
