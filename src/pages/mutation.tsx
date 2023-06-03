import { type NextPage } from "next";
import { api } from "~/utils/api";

//Example how to infer a type from a trpc

/* import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
type RouterOutput = inferRouterOutputs<AppRouter>;
type GetDetailsResult = RouterOutput['wallet']['getWalletDetails'] 
 */

// wallet ARS BILLETE clhugzcsa0008v21882qnah3z
// wallet USD BILLETE clhwh2a49000cv29sl4jmr5bv
// wallet EUR BANK clia899ob0000v2x47b7clvts


const Home: NextPage = () => {

  // const newTransaction = api.wallet.newTransaction.useMutation()
  // const newTransfer = api.wallet.transfer.useMutation()
  const newTransfer = api.category.newCategory.useMutation()

  const handleFetch = () => {
    // newTransaction.mutate(
    //   {
    //     walletId: "clhugzcsa0008v21882qnah3z",
    //     name: "test transaction",
    //     value: 99,
    //     categoryId: "clhwgs0wj0004v29si0jvsvp7",
    //   },
    //   {
    //     onSuccess: (data) => {
    //       console.log("data", JSON.stringify(data))
    //     }
    //   }
    // )
    // newTransfer.mutate(
    //   {
    //     name: "test transfer",
    //     sourceValue: -10000,
    //     sourceWalletId: "clhugzcsa0008v21882qnah3z",
    //     targetValue: 20,
    //     targetWalletId: "clhwh2a49000cv29sl4jmr5bv",
    //   },
    //   {
    //     onSuccess: (data) => {
    //       console.log("data", JSON.stringify(data))
    //     },
    //     onError: (error) => {
    //       console.log("error", JSON.stringify(error))
    //     }
    //   }
    // )
    newTransfer.mutate(
      {
        name: "test category",
        expense: true,
      },
      {
        onSuccess: (data) => {
          console.log("data", JSON.stringify(data))
        },
        onError: (error) => {
          console.log("error", JSON.stringify(error))
        }
      }
    )
  }

  return (
    <main className="flex min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-16 px-4 py-16 ">
        <h1 className="text-5xl">
          {/* {query.isLoading ? "Script Loading..." : "Script done"}
          {query.error && " - with errors"} */}
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="p-4">
            {/* {query.data && JSON.stringify(query.data)}
            {query.error && JSON.stringify(query.error.message)} */}
            <button className="bg-blue-500 rounded text-white py-2 px-4" onClick={handleFetch}>
              Fetch
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;