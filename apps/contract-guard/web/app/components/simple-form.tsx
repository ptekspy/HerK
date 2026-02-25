'use client';

import { useState, FormEvent } from 'react';

import { apiPost } from '../../lib/api';

export function SimpleCreateForm({
  endpoint,
  title,
  fields,
}: {
  endpoint: string;
  title: string;
  fields: Array<{ name: string; label: string; placeholder?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setLoading(true);
    try {
      await apiPost(endpoint, payload);
      setOk(`${title} created.`);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid">
      {fields.map((field) => (
        <label key={field.name}>
          {field.label}
          <input name={field.name} placeholder={field.placeholder} required />
        </label>
      ))}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Saving…' : `Create ${title}`}
      </button>

      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </form>
  );
}
