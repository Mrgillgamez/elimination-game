import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { COUNTRIES } from '../countries';
import './CountrySelector.css';

// Shown once, right after signup, before the user reaches /host.
// Stores their country on their profile row - this choice later drives
// which localized price they see (Stage C7).
function CountrySelector({ userId, onDone }) {
  const [countryCode, setCountryCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!countryCode) {
      setError('Please select your country.');
      return;
    }
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('profiles')
      .update({ country: countryCode })
      .eq('id', userId);
    setSaving(false);
    if (error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    onDone();
  };

  return (
    <div className="country-overlay">
      <div className="country-card">
        <h1>Where are you playing from?</h1>
        <p className="country-subnote">This helps us show you the right pricing later.</p>

        <select
          className="country-select"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          <option value="" disabled>Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        {error && <p className="country-error">{error}</p>}

        <button className="country-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default CountrySelector;
