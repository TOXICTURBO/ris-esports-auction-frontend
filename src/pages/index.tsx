import { useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

interface Player {
  _id: string;
  name: string;
  image: string;
  role: string;
  basePrice: number;
}

interface Bid {
  _id: string;
  team: string;
  teamName: string;
  amount: number;
  timestamp: string;
}

interface AuctionState {
  active: boolean;
  currentPlayer: Player | null;
  timeRemaining: number;
  highestBid: {
    team: string;
    teamName: string;
    amount: number;
  } | null;
}

export default function AuctionPage() {
  const { socket } = useSocket();
  const [auctionState, setAuctionState] = useState<AuctionState>({
    active: false,
    currentPlayer: null,
    timeRemaining: 60,
    highestBid: null
  });
  const [bids, setBids] = useState<Bid[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('auction_update', (state: AuctionState) => {
      setAuctionState(state);
      if (state.currentPlayer) {
        fetchBids(state.currentPlayer._id);
      }
    });

    socket.on('new_bid', (bid: Bid) => {
      setBids(prev => [bid, ...prev]);
    });

    fetchTeams();
    fetchAuctionState();

    return () => {
      socket.off('auction_update');
      socket.off('new_bid');
    };
  }, [socket]);

  const fetchAuctionState = async () => {
    const res = await axios.get('/api/auction');
    setAuctionState(res.data);
    if (res.data.currentPlayer) {
      fetchBids(res.data.currentPlayer._id);
    }
  };

  const fetchBids = async (playerId: string) => {
    const res = await axios.get(`/api/bids?playerId=${playerId}`);
    setBids(res.data);
  };

  const fetchTeams = async () => {
    const res = await axios.get('/api/teams');
    setTeams(res.data);
    if (res.data.length > 0) {
      setSelectedTeam(res.data[0]._id);
    }
  };

  const handleBid = async () => {
    if (!selectedTeam || !auctionState.currentPlayer) return;
    
    try {
      await axios.post('/api/bids', {
        teamId: selectedTeam,
        amount: bidAmount
      });
      setBidAmount(0);
    } catch (error) {
      console.error('Bid failed:', error);
    }
  };

  useEffect(() => {
    if (!auctionState.active || auctionState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setAuctionState(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionState.active, auctionState.timeRemaining]);

  return (
    <div className="min-h-screen p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-ris-blue">RIS Esports Auction</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Auction */}
        <div className="lg:col-span-2 bg-ris-gray rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-ris-blue">Current Auction</h2>
          
          {auctionState.currentPlayer ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="bg-ris-light-gray rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-ris-dark rounded-full flex items-center justify-center">
                      <span className="text-3xl">🎮</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{auctionState.currentPlayer.name}</h3>
                      <p className="text-gray-400">{auctionState.currentPlayer.role}</p>
                      <p className="text-ris-blue font-mono">Base: ${auctionState.currentPlayer.basePrice}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-ris-light-gray rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Time Remaining</span>
                    <span className={`font-mono ${auctionState.timeRemaining <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                      {auctionState.timeRemaining}s
                    </span>
                  </div>
                  <div className="h-2 bg-ris-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ris-blue rounded-full" 
                      style={{ width: `${(auctionState.timeRemaining / 60) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-ris-light-gray rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Highest Bid</h4>
                  {auctionState.highestBid ? (
                    <div className="flex justify-between items-center">
                      <span>{auctionState.highestBid.teamName}</span>
                      <span className="text-ris-blue font-mono">${auctionState.highestBid.amount}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">No bids yet</p>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-ris-light-gray rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-3">Place Bid</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Team</label>
                      <select
                        className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                      >
                        {teams.map(team => (
                          <option key={team._id} value={team._id}>
                            {team.name} (${team.credits})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Bid Amount</label>
                      <input
                        type="number"
                        className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={auctionState.highestBid ? auctionState.highestBid.amount + 1 : auctionState.currentPlayer.basePrice}
                        max={teams.find(t => t._id === selectedTeam)?.credits || 0}
                      />
                    </div>
                    <button
                      className="w-full bg-ris-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                      onClick={handleBid}
                      disabled={!auctionState.active}
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No active auction</p>
            </div>
          )}
        </div>

        {/* Bidding History */}
        <div className="bg-ris-gray rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-ris-blue">Bidding History</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bids.length > 0 ? (
              bids.map(bid => (
                <div key={bid._id} className="bg-ris-light-gray rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{bid.teamName}</span>
                    <span className="text-ris-blue font-mono">${bid.amount}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(bid.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No bids yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
