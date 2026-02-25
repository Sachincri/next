import { useGetCoinHistoryQuery } from "@/redux/api/userApi";

export const RewardsSection = ({ rewards }: { rewards: number }) => {
    // rewards prop currently contains dummy data or user.rewards if populated.
    // We will use it for the TOTAL points card if it has that info, OR we can use the user object from parent.
    // The parent passes `dummyRewards` with 'total-points' item. Let's keep that for the HEAD CARD.

    const { data, isLoading } = useGetCoinHistoryQuery();
    const history: any[] = (data as { history?: any[] })?.history || [];

    return (
        <div className="space-y-6">
            {/* Summary Card - Taken from props or could be from user stats */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 text-white p-8 rounded-xl shadow-lg border border-purple-500/20">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-lg font-semibold mb-2 opacity-90">Total Reward Points</div>
                        {/* We use the first item from props which parent hacked to contain total points */}
                        <div className="text-4xl font-bold mb-2">{rewards}</div>
                        <div className="text-sm opacity-75">Earn more points with every purchase</div>
                    </div>
                    <div className="text-6xl opacity-20">🎁</div>
                </div>
            </div>

            {/* History List */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Coin History</h3>

            {isLoading ? (
                <div className="text-center py-10 text-slate-400">Loading history...</div>
            ) : history.length > 0 ? (
                <div className="grid gap-4">
                    {history.map((item: any, index: number) => (
                        <div key={item._id || index} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md dark:hover:shadow-slate-950/20 transition-all duration-200">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${item.type === 'earn' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                        }`}>
                                        {item.type === 'earn' ? '💰' : '💸'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800 dark:text-slate-100">{item.description || "Point Transaction"}</div>
                                        <div className="text-gray-600 dark:text-slate-400 text-sm">
                                            {new Date(item.createdAt || item.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-lg ${item.type === 'earn' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.type === 'earn' ? '+' : '-'}{Math.abs(item.amount)} pts
                                    </div>
                                    {/* <button className="mt-2 text-xs text-gray-400 underline">Details</button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-slate-400">No coin history available yet.</p>
                </div>
            )}
        </div>
    );
}