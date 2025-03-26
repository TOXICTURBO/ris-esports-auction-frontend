import { useState, useEffect } from 'react';
import axios from 'axios';

interface Player {
  _id: string;
  name: string;
  role: string;
  basePrice: number;
  sold: boolean;
}

interface Team {
  _id: string;
  name: string;
  credits: number;
  players?: {
    _id: string;
    name: string;
    role: string;
    soldPrice: number;
  }[];
}

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    role: 'Top',
    basePrice: 100
  });
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<number>(100);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    const res = await axios.get('/api/players');
    setPlayers(res.data);
  };

  const fetchTeams = async () => {
    const res = await axios.get('/api/teams');
    setTeams(res.data);
  };

  const startAuction = async (playerId: string) => {
    await axios.post('/api/auction/start', { playerId });
  };

  const addPlayer = async () => {
    await axios.post('/api/players', newPlayer);
    setNewPlayer({
      name: '',
      role: 'Top',
      basePrice: 100
    });
    fetchPlayers();
  };

  const addCredits = async (teamId: string) => {
    await axios.post('/api/teams/credits', {
      teamId,
      amount: creditAmount
    });
    fetchTeams();
    setCreditAmount(100);
  };

  return (
    <div className="min-h-screen p-4 bg-ris-dark text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-ris-blue">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Players Section */}
        <div className="bg-ris-gray rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-ris-blue">Players</h2>
          
          <div className="mb-6 bg-ris-light-gray rounded-lg p-4">
            <h3 className="font-semibold mb-3">Add New Player</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select
                  className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                  value={newPlayer.role}
                  onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})}
                >
                  <option value="Top">Top</option>
                  <option value="Jungle">Jungle</option>
                  <option value="Mid">Mid</option>
                  <option value="ADC">ADC</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Base Price</label>
                <input
                  type="number"
                  className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                  value={newPlayer.basePrice}
                  onChange={(e) => setNewPlayer({...newPlayer, basePrice: Number(e.target.value)})}
                />
              </div>
              <button
                className="bg-ris-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                onClick={addPlayer}
              >
                Add Player
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="font-semibold">Player List</h3>
            {players.map(player => (
              <div key={player._id} className="bg-ris-light-gray rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{player.name}</span>
                  <span className="text-gray-400 text-sm ml-2">({player.role})</span>
                  <div className="text-ris-blue font-mono text-sm">${player.basePrice}</div>
                </div>
                <div>
                  {player.sold ? (
                    <span className="text-red-400 text-sm">Sold</span>
                  ) : (
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded transition"
                      onClick={() => startAuction(player._id)}
                    >
                      Start Auction
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-ris-gray rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-ris-blue">Teams</h2>
          
          <div className="mb-6 bg-ris-light-gray rounded-lg p-4">
            <h3 className="font-semibold mb-3">Add Credits</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team</label>
                <select
                  className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full bg-ris-dark border border-ris-light-gray rounded px-3 py-2"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                />
              </div>
              <button
                className="bg-ris-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                onClick={() => selectedTeam && addCredits(selectedTeam)}
                disabled={!selectedTeam}
              >
                Add Credits
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Team List</h3>
            {teams.map(team => (
              <div key={team._id} className="bg-ris-light-gray rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-ris-blue font-mono">${team.credits}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Players: {team.players ? team.players.length : 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
