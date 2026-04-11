import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/env";

/**
 * DelegationManager
 * Two-panel UI:
 *  Left  – delegates I have granted (principal view)
 *  Right – principals I can act on behalf of (delegate view) + context switcher
 */
const DelegationManager = () => {
  const { user, delegateContext, setDelegateContext } = useContext(AuthContext);

  const [myDelegates, setMyDelegates] = useState([]);   // people I granted access to
  const [principals, setPrincipals] = useState([]);       // people who granted me access
  const [loading, setLoading] = useState(true);

  // Grant-delegate form
  const [grantUsername, setGrantUsername] = useState("");
  const [grantExpiry, setGrantExpiry] = useState("");
  const [granting, setGranting] = useState(false);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [delegatesRes, principalsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/delegations/my-delegates`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/api/v1/delegations/delegating-for`, {
          withCredentials: true,
        }),
      ]);
      setMyDelegates(delegatesRes.data.data || []);
      setPrincipals(principalsRes.data.data || []);
    } catch {
      toast.error("Failed to load delegation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Grant delegate ─────────────────────────────────────────────────────────
  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantUsername.trim()) { toast.error("Enter a username"); return; }
    try {
      setGranting(true);
      await axios.post(
        `${API_BASE_URL}/api/v1/delegations`,
        { delegateUsername: grantUsername.trim(), expiresAt: grantExpiry || undefined },
        { withCredentials: true }
      );
      toast.success(`Delegate access granted to @${grantUsername}`);
      setGrantUsername("");
      setGrantExpiry("");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to grant delegate");
    } finally {
      setGranting(false);
    }
  };

  // ── Revoke delegate ────────────────────────────────────────────────────────
  const handleRevoke = async (delegationId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/delegations/${delegationId}`,
        { withCredentials: true }
      );
      toast.success("Delegation revoked");
      refresh();
    } catch {
      toast.error("Failed to revoke");
    }
  };

  // ── Switch context ─────────────────────────────────────────────────────────
  const handleSwitchContext = async (principal) => {
    if (delegateContext?.principalId === principal._id) {
      // Revert to own context
      setDelegateContext(null);
      toast.info("Reverted to your own context");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/delegations/switch-context`,
        { principalId: principal._id },
        { withCredentials: true }
      );
      setDelegateContext({
        principalId: principal._id,
        principalName: principal.name,
        principalUsername: principal.username,
      });
      toast.success(`Now acting as ${principal.name} (@${principal.username})`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Context switch failed");
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-dark)] min-h-screen">
      <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Delegation & Access Control</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Grant assistants the ability to submit and manage expenses on your behalf, or switch context to act as someone else.
        </p>
      </div>

      {/* Active delegate context banner */}
      {delegateContext && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-amber-800 text-sm">
            🎭 Acting as{" "}
            <strong>
              {delegateContext.principalName} (@{delegateContext.principalUsername})
            </strong>
            . Expenses you submit will be owned by them.
          </span>
          <button
            onClick={() => { setDelegateContext(null); toast.info("Reverted to own context"); }}
            className="text-amber-700 hover:text-amber-900 text-sm underline ml-4"
          >
            Revert to self
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Left: Delegates I have granted ─────────────────────────────────── */}
        <div className="bg-[var(--card-dark)] border border-[var(--border-dark)] rounded-lg p-5">
          <h2 className="font-semibold mb-4">My Delegates</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            These users can submit and manage expenses on your behalf.
          </p>

          {/* Grant form */}
          <form onSubmit={handleGrant} className="space-y-2 mb-5">
            <input
              placeholder="Username to grant access"
              value={grantUsername}
              onChange={(e) => setGrantUsername(e.target.value)}
              className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            <input
              type="datetime-local"
              placeholder="Expires at (optional)"
              value={grantExpiry}
              onChange={(e) => setGrantExpiry(e.target.value)}
              className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded text-sm text-[var(--text-primary)]"
            />
            <button
              type="submit"
              disabled={granting}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 w-full transition-colors"
            >
              {granting ? "Granting…" : "Grant Delegate Access"}
            </button>
          </form>

          {loading && <p className="text-xs text-[var(--text-muted)]">Loading…</p>}
          {!loading && myDelegates.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">No delegates granted yet.</p>
          )}
          <ul className="space-y-2">
            {myDelegates.map((d) => (
              <li
                key={d._id}
                className="flex items-center justify-between bg-[var(--bg-dark)] px-3 py-2 rounded border border-[var(--border-dark)]"
              >
                <div>
                  <p className="text-sm font-medium">{d.delegate?.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    @{d.delegate?.username}
                    {d.expiresAt && (
                      <span>
                        {" "}· Expires {new Date(d.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(d._id)}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-2 py-1 rounded"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Principals I can act for ─────────────────────────────────── */}
        <div className="bg-[var(--card-dark)] border border-[var(--border-dark)] rounded-lg p-5">
          <h2 className="font-semibold mb-4">Acting on Behalf Of</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            These users have granted you delegate access. Switch context to submit expenses on their behalf.
          </p>

          {loading && <p className="text-xs text-[var(--text-muted)]">Loading…</p>}
          {!loading && principals.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              No one has delegated access to you yet.
            </p>
          )}
          <ul className="space-y-2">
            {principals.map((d) => {
              const isActive = delegateContext?.principalId === d.principal?._id;
              return (
                <li
                  key={d._id}
                  className={`flex items-center justify-between px-3 py-2 rounded border transition-colors ${
                    isActive
                      ? "bg-amber-50 border-amber-200"
                      : "bg-[var(--bg-dark)] border-[var(--border-dark)]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{d.principal?.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      @{d.principal?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSwitchContext(d.principal)}
                    className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${
                      isActive
                        ? "bg-yellow-600 text-white hover:bg-yellow-500"
                        : "bg-[var(--accent)] text-white hover:opacity-90"
                    }`}
                  >
                    {isActive ? "Active · Revert" : "Switch Context"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DelegationManager;
