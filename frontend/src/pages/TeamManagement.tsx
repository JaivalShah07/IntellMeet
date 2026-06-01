import { useEffect, useState } from "react";
import { Users, Plus, Link as LinkIcon, Loader2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function TeamManagement() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    api
      .get("/teams")
      .then((res) => setTeams(res.data.teams))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const name = newTeamName.trim();
    setNewTeamName("");

    const tempId = `temp-${Date.now()}`;
    const newTeam = {
      _id: tempId,
      name,
      members: [{ _id: user?.id || "me", name: user?.name || "You", email: user?.email || "" }]
    };
    setTeams((prev) => [...prev, newTeam]);

    setCreating(true);
    try {
      const { data } = await api.post("/teams", { name });
      setTeams((prev) => prev.map(t => t._id === tempId ? (data.team || { ...newTeam, _id: data._id || tempId }) : t));
    } catch (err: any) {
      setTeams((prev) => prev.filter(t => t._id !== tempId));
      alert(err.response?.data?.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateInvite = async (teamId: string) => {
    try {
      const { data } = await api.post("/teams/invite", { teamId });
      const link = `${window.location.origin}/invite/${data.invitationToken}`;
      setInviteToken(link);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate invite");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-500">Only administrators can access team management.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Team Management"
          subtitle="Manage workspaces and invite members."
          icon={Users}
        />

        <div className="card-elevated rounded-2xl p-6 mb-8">
          <h3 className="font-bold mb-4">Create New Team</h3>
          <form onSubmit={handleCreateTeam} className="flex gap-4">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name..."
              className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Create
            </button>
          </form>
        </div>

        {inviteToken && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-8 dark:bg-emerald-900/20 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">Invite Link Generated!</h4>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={inviteToken}
                className="flex-1 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteToken)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Valid for 7 days.</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team._id} className="card-elevated p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{team.members.length} members</p>
                <div className="space-y-3">
                  {team.members.map((m: any) => (
                    <div key={m._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleGenerateInvite(team._id)}
                    className="w-full py-2 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> Generate Invite Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
