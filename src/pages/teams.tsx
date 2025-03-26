import { useState, useEffect } from 'react';
import axios from 'axios';

interface Team {
  _id: string;
  name: string;
  credits: number;
  players: {
    _id: string;
    name: string;
    role: string;
    soldPrice: number;
  }[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const res = await axios.get('/api/teams');
    setTeams(res.data);
  };

  return (
    <div className="min-h-screen p-4 bg-ris-dark text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-ris-blue">Teams</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team._id} className="bg-ris-gray rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <span className="text-ris-blue font-mono">${team.credits}</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-ris-blue">Players</h3>
              {team.players && team.players.length > 0 ? (
                team.players.map(player => (
                  <div key={player._id} className="bg-ris-light-gray rounded p-3">
                    <div className="flex justify-between">
                      <span>{player.name}</span>
                      <span className="text-ris-blue font-mono">${player.soldPrice}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{player.role}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No players purchased yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
