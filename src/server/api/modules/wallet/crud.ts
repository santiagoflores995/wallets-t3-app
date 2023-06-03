import { type TRPCContext } from "../../trpc"

type balanceHistory = {
  date: Date,
  value: number,
  currencySymbol: string
}
type DateResolution = "DAILY" | "WEEKLY"
const UsdSymbol = "USD"

const getWalletTransactionsWithUsdRate = (ctx: TRPCContext, walletId: string, toDate: Date) => {
  return ctx.prisma.wallet.findUnique({
    where: {
      id: walletId,
    },
    include: {
      transaction: {
        where: {
          date: {
            lte: toDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      },
      currency: {
        include: {
          CurrencyUsdConversionRate: {
            where: {
              date: {
                lte: toDate
              }
            },
            orderBy: {
              date: 'asc'
            },
          },
        }
      }
    }
  })
}

export const getWalletWithTimeline = async (
  ctx: TRPCContext,
  walletId: string,
  fromDate = new Date(new Date().getFullYear(), new Date().getMonth()+1, 1),
  toDate = new Date(),
  group: DateResolution = "DAILY" 
 ) => {
  const wallet = await getWalletTransactionsWithUsdRate(ctx, walletId, toDate)
  if(!wallet) {
    throw new Error("Wallet not found")
  }
  let balance = wallet?.initialBalance || 0
  const balanceHistoryNative: balanceHistory[] = []
  const groupByDays = group === "DAILY" ? 1 : 7

  for (let day = fromDate; day <= toDate; day.setDate(day.getDate() + groupByDays)) {
    let spliceUpTo = 0
    for (let i = 0; i < wallet.transaction.length; i++) {
      const element = wallet.transaction[i]
      if(!element || element.date > day){
        break
      }
      balance += element.value
      spliceUpTo = i+1
    }
    wallet.transaction.splice(0, spliceUpTo)
    balanceHistoryNative.push({
      date: new Date(day.getTime()),
      value: balance,
      currencySymbol: wallet.currency.symbol
    })
  }  

  return {
    ...wallet,
    balance,
    balanceHistoryNative
  }
}

export const getWalletWithTimelineOnUsd = async (
  ctx: TRPCContext,
  walletId: string,
  fromDate = new Date(),
  toDate = new Date(),
  group?: DateResolution,
 ) => {
  const res = await getWalletWithTimeline(ctx, walletId, fromDate, toDate, group)
  const balanceHistoryUSD: balanceHistory[]  = []
  res.balanceHistoryNative.forEach(history => {
    const rate = getConversionRateForTransaction(res, history.date)
    balanceHistoryUSD.push({
      date: history.date,
      value: history.value * rate,
      currencySymbol: UsdSymbol
    })
  })
  return {
    ...res,
    balanceHistoryUSD
  }
}

export const createTransaction = async (
  ctx: TRPCContext,
  walletId: string,
  name: string,
  value: number,
  date?: Date,
  categoryId?: string,
) => {
  return ctx.prisma.transaction.create({
    data: {
      walletId,
      name,
      value,
      date: date || new Date(),
      categoryId,
    }
  })
}

export const createTransfer = async (
  ctx: TRPCContext,
  name: string,
  sourceWalletId: string,
  sourceValue: number,
  targetWalletId: string,
  targetValue: number,
  date = new Date()
) => {
  const transferCategoryIncomeId = "cli7m6p5s0000v2qg101cz98c"
  const transferCategoryExpenseId = "cli7m6p5s0002v2qgmvw25wvh"
  return ctx.prisma.transfer.create({
    data: {
      name,
      date: date,
      sourceTransaction: {
        create: {
          name: `Transfer to another wallet`, 
          value: sourceValue,
          walletId: sourceWalletId,
          date: date,
          categoryId: transferCategoryExpenseId,
        }
      },
      targetTransaction: {
        create: {
          name: `Transfer from another wallet`,
          value: targetValue,
          walletId: targetWalletId,
          date: date,
          categoryId: transferCategoryIncomeId,
        }
      }
    }
  })
}

function getConversionRateForTransaction(wallet: Awaited<ReturnType<typeof getWalletTransactionsWithUsdRate>>, date: Date) {
  let rate = 1
  if(wallet?.currency.CurrencyUsdConversionRate) {
    for (let i = 0; i < wallet.currency.CurrencyUsdConversionRate.length; i++) {
      const element = wallet.currency.CurrencyUsdConversionRate[i];
      if(element?.date) {
        if(element.date <= date) {
          rate = element?.rate
        } else {
          break
        }
      }
    }
  }
  return rate
}