import {
  createTRPCRouter, publicProcedure
} from "~/server/api/trpc";
import { z } from "zod";

const inputNewCategory = z.object({ 
  name: z.string(),
  expense: z.boolean(),
})

const inputByCategoryId = z.object({ categoryId: z.string() })

export const categoryRouter = createTRPCRouter({
  getCategory: publicProcedure
    .input(inputByCategoryId)
    .query(({ ctx, input }) => ctx.prisma.category.findUnique({where: {id: input.categoryId}})),
  
  newCategory: publicProcedure
    .input(inputNewCategory)
    .mutation(({ ctx, input }) => {
      const { name, expense } = input
      return ctx.prisma.category.create({
        data: {
          name,
          expense,
        }
      })
    })
});