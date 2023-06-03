import {
  createTRPCRouter, publicProcedure
} from "~/server/api/trpc";
import { createTransaction, createTransfer, getWalletWithTimeline, getWalletWithTimelineOnUsd } from "../modules/wallet/crud";
import { z } from "zod";

const getWalletWithBalanceTimelineInput = z.object({ 
  walletId: z.string(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  group:  z.union([
    z.literal('DAILY'),
    z.literal('WEEKLY'),
  ]).optional(),
})

export const walletRouter = createTRPCRouter({
  getWallet: publicProcedure
    .input(z.object({ walletId: z.string() }))
    .query(({ ctx, input }) => ctx.prisma.wallet.findUnique({where: {id: input.walletId}})),

  getWalletWithBalanceTimeline: publicProcedure
    .input(getWalletWithBalanceTimelineInput)
    .query(({ ctx, input }) => getWalletWithTimeline(
      ctx, 
      input.walletId,
      input.fromDate,
      input.toDate,
      input.group
    )),

  getWalletWithBalanceTimelineOnUsd: publicProcedure
  .input(getWalletWithBalanceTimelineInput)
    .query(({ ctx, input }) => getWalletWithTimelineOnUsd(
      ctx, 
      input.walletId,
      input.fromDate,
      input.toDate,
      input.group,
    )),
  
  newTransaction: publicProcedure
    .input(z.object({ 
      walletId: z.string(),
      name: z.string(),
      value: z.number().nonnegative(),
      date: z.date().optional(),
      categoryId: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { walletId, name, value, date, categoryId } = input
      return createTransaction(ctx, walletId, name, value, date, categoryId)
    }),
  
  transfer: publicProcedure
    .input(z.object({ 
      name: z.string(),
      sourceWalletId: z.string(),
      sourceValue: z.number().negative(),
      targetWalletId: z.string(),
      targetValue: z.number().positive(),
      date: z.date().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { name, sourceWalletId, sourceValue, targetWalletId, targetValue, date } = input
      return createTransfer(ctx, name, sourceWalletId, sourceValue, targetWalletId, targetValue, date)
    }),
  
});