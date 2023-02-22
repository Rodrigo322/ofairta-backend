import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../database/prisma";

const singInSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor preencha o e-mail corretamente" }),
  password: z
    .string()
    .min(6, { message: "A senha deve conter pelo 6 menos caracteres." }),
});

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = singInSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        accessLevels: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.json({ error: "Usuário não encontrado!" });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({ error: "Senha incorreta!" });
    }

    const MY_SECRET_KEY = process.env.MY_SECRET_KEY;

    if (!MY_SECRET_KEY) {
      throw new Error("A chave secreta não foi definida corretamente");
    }

    // Gera o token de autenticação
    const token = sign(
      { userId: user.id, role: user.accessLevels },
      MY_SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json(error);
  }
};
