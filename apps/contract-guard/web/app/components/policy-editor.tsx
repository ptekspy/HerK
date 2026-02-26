'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiPut } from '../../lib/api';

type PolicySeverity = 'OFF' | 'WARN' | 'BLOCK';

const RULES: Array<{
  code: string;
  title: string;
  defaultSeverity: PolicySeverity;
}> = [
  { code: 'endpoint.removed', title: 'Endpoint removed', defaultSeverity: 'BLOCK' },
  {
    code: 'schema.required_added',
    title: 'Required field added',
    defaultSeverity: 'BLOCK',
  },
  { code: 'schema.type_changed', title: 'Schema type changed', defaultSeverity: 'BLOCK' },
  { code: 'schema.enum_narrowed', title: 'Enum narrowed', defaultSeverity: 'BLOCK' },
];

interface PolicyEditorProps {
  orgId: string;
  initialFailOnBreaking: boolean;
  initialRuleOverrides: Record<string, string>;
}

export function PolicyEditor({
  orgId,
  initialFailOnBreaking,
  initialRuleOverrides,
}: PolicyEditorProps) {
  const router = useRouter();
  const [failOnBreaking, setFailOnBreaking] = useState(initialFailOnBreaking);
  const [ruleOverrides, setRuleOverrides] = useState<Record<string, PolicySeverity>>(() => {
    const result: Record<string, PolicySeverity> = {};

    for (const rule of RULES) {
      const incoming = initialRuleOverrides[rule.code];
      if (incoming === 'OFF' || incoming === 'WARN' || incoming === 'BLOCK') {
        result[rule.code] = incoming;
      } else {
        result[rule.code] = rule.defaultSeverity;
      }
    }

    return result;
  });

  const unknownRuleOverrides = useMemo(() => {
    const knownRules = new Set(RULES.map((rule) => rule.code));
    return Object.fromEntries(
      Object.entries(initialRuleOverrides).filter(([rule]) => !knownRules.has(rule)),
    );
  }, [initialRuleOverrides]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSave = async () => {
    setError(null);
    setOk(null);
    setLoading(true);

    try {
      await apiPut(`/v1/orgs/${orgId}/policies/default`, {
        failOnBreaking,
        ruleOverrides: {
          ...unknownRuleOverrides,
          ...ruleOverrides,
        },
      });

      setOk('policy updated.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-grid">
      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={failOnBreaking}
          onChange={(event) => setFailOnBreaking(event.target.checked)}
        />
        Fail check when breaking changes exist
      </label>

      <table className="table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {RULES.map((rule) => (
            <tr key={rule.code}>
              <td>{rule.title}</td>
              <td>
                <select
                  value={ruleOverrides[rule.code]}
                  onChange={(event) => {
                    const value = event.target.value as PolicySeverity;
                    setRuleOverrides((current) => ({
                      ...current,
                      [rule.code]: value,
                    }));
                  }}
                >
                  <option value="OFF">OFF</option>
                  <option value="WARN">WARN</option>
                  <option value="BLOCK">BLOCK</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary" type="button" onClick={onSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save policy'}
      </button>

      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </div>
  );
}
