import { hash } from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../database/prisma";

const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve conter no mínimo 3 caracteres." }),
  email: z.string().email(),
  cpf: z
    .string()
    .min(11, { message: "O CPF deve conter no mínimo 11 caracteres." }),
  password: z
    .string()
    .min(6, { message: "O CPF deve conter no mínimo 6 caracteres." }),
  accessLevelName: z.string(),
});

const userUpdateSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve conter no mínimo 3 caracteres." })
    .optional(),
  email: z.string().email().optional(),
  cpf: z
    .string()
    .min(11, { message: "O CPF deve conter no mínimo 11 caracteres." })
    .optional(),
  password: z
    .string()
    .min(6, { message: "O CPF deve conter no mínimo 6 caracteres." })
    .optional(),
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, cpf, password, accessLevelName } = userSchema.parse(
      req.body
    );

    const isUser = await prisma.user.findUnique({ where: { email } });

    if (isUser) {
      return res
        .status(400)
        .json({ message: "Já existe um usuário com este e-mail!" });
    }

    const isAccessLevel = await prisma.accessLevel.findUnique({
      where: { name: accessLevelName },
    });

    if (!isAccessLevel) {
      return res
        .status(400)
        .json({ message: "Nível de acesso não encontrado!" });
    }

    const hash_password = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash_password,
        cpf,
        accessLevels: {
          connect: {
            id: isAccessLevel.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        accessLevels: {
          select: {
            name: true,
          },
        },
      },
    });

    if (users.length <= 0) {
      res.status(204).json({ message: "Nenhum usuário encontrado!" });
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getUniqueUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "usuário não encontrado!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, cpf, password } = userUpdateSchema.parse(req.body);
    const { id } = req.user;

    const isUser = await prisma.user.findUnique({
      where: { email },
    });

    if (isUser) {
      return res
        .status(400)
        .json({ message: "Já existe um usuário com esté e-mail." });
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        password,
        cpf,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Usuário apagado com sucesso." });
  } catch (error) {
    return res.status(200).json({ message: error });
  }
};
