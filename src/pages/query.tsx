import { type NextPage } from "next";
import { api } from "~/utils/api";


const Home: NextPage = () => {
  const query = api.wallet.getWalletWithBalanceTimeline.useQuery(
    { walletId: "clia899ob0000v2x47b7clvts"}, 
    { retry: 0 }
  )

  if(query.data) {
    console.log('balance: ', query.data.balance)
  }

  return (
    <main className="flex min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-16 px-4 py-16 ">
        <h1 className="text-5xl">
          {query.isLoading ? "Script Loading..." : "Script done"}
          {query.error && " - with errors"}
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="p-4">
            {query.data && JSON.stringify(query.data)}
            {query.error && JSON.stringify(query.error.message)}
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;