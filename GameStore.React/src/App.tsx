import { useEffect, useState, type FormEvent } from 'react';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

type GameSummary = {
  id: number;
  name: string;
  genre: string;
  price: number;
  releaseDate: string;
};

type Genre = {
  id: number;
  name: string;
};

type FormState = {
  name: string;
  genreId: number;
  price: string;
  releaseDate: string;
};

const initialFormState: FormState = {
  name: '',
  genreId: 0,
  price: '',
  releaseDate: ''
};

function App() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    fetchGenres();
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const response = await fetch(`${apiBaseUrl}/games`);
      if (!response.ok) {
        throw new Error('Unable to load games.');
      }
      const data = await response.json();
      setGames(data);
    } catch (error) {
      setError('Failed to load games.');
    }
  }

  async function fetchGenres() {
    try {
      const response = await fetch(`${apiBaseUrl}/genres`);
      if (!response.ok) {
        throw new Error('Unable to load genres.');
      }
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      setError('Failed to load genres.');
    }
  }

  async function loadGameForEdit(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/games/${id}`);
      if (!response.ok) {
        throw new Error('Unable to load game details.');
      }
      const detail = await response.json();
      setForm({
        name: detail.name,
        genreId: detail.genreId,
        price: detail.price.toString(),
        releaseDate: detail.releaseDate.slice(0, 10)
      });
      setEditingId(detail.id);
      setShowSheet(true);
      setStatus('Editing game.');
      setError('');
    } catch (error) {
      setError('Failed to load game details.');
    }
  }

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
    setStatus('');
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!form.name.trim()) {
      setError('Game name is required.');
      return;
    }

    if (!form.genreId) {
      setError('Please select a genre.');
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setError('Valid price is required.');
      return;
    }

    if (!form.releaseDate) {
      setError('Release date is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      genreId: form.genreId,
      price: Number(form.price),
      releaseDate: form.releaseDate
    };

    try {
      const url = editingId ? `${apiBaseUrl}/games/${editingId}` : `${apiBaseUrl}/games`;
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Save failed.');
      }

      await fetchGames();
      setShowSheet(false);
      resetForm();
      setStatus(editingId ? 'Game updated successfully.' : 'Game added successfully.');
    } catch (error) {
      setError('Unable to save game.');
    }
  }

  async function handleDelete(id: number) {
    setError('');
    setStatus('');

    if (!window.confirm('Delete this game?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/games/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Delete failed.');
      }
      await fetchGames();
      setStatus('Game deleted successfully.');
    } catch (error) {
      setError('Unable to delete game.');
    }
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-content">
          <div>
            <h1>Game Store Manager</h1>
            <p>Manage your game catalog with ease</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{games.length}</span>
              <span className="stat-label">Total Games</span>
            </div>
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="table-section">
          {games.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <p>No games in your library yet.</p>
              <span>Click the + button to add your first game</span>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Game Title</th>
                    <th>Genre</th>
                    <th>Price</th>
                    <th>Release Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td className="game-name">{game.name}</td>
                      <td><span className="genre-badge">{game.genre}</span></td>
                      <td className="price">${game.price.toFixed(2)}</td>
                      <td className="release-date">{game.releaseDate}</td>
                      <td className="actions">
                        <button type="button" className="btn-icon btn-edit" onClick={() => loadGameForEdit(game.id)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L4.99967 13.6667L1.33301 14.6667L2.33301 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button type="button" className="btn-icon btn-delete" onClick={() => handleDelete(game.id)} title="Delete">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setShowSheet(true)} title="Add Game">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Sheet Overlay */}
      {showSheet && <div className="sheet-overlay" onClick={() => setShowSheet(false)} />}

      {/* Slide-out Sheet */}
      <div className={`sheet ${showSheet ? 'sheet-open' : ''}`}>
        <div className="sheet-header">
          <h2>{editingId ? 'Edit Game' : 'Add New Game'}</h2>
          <button className="btn-close" onClick={() => setShowSheet(false)} title="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="sheet-content">
          <form onSubmit={handleSubmit}>
            <label>
              <span className="label-text">Game Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Enter game title"
                autoFocus
              />
            </label>

            <label>
              <span className="label-text">Genre</span>
              <select
                value={form.genreId}
                onChange={(event) => setForm({ ...form, genreId: Number(event.target.value) })}
              >
                <option value={0}>Select genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="label-text">Price (USD)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                placeholder="0.00"
              />
            </label>

            <label>
              <span className="label-text">Release Date</span>
              <input
                type="date"
                value={form.releaseDate}
                onChange={(event) => setForm({ ...form, releaseDate: event.target.value })}
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Game' : 'Add Game'}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {status && <div className="alert alert-success">{status}</div>}
          {error && <div className="alert alert-error">{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default App;
