'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Label } from '@herk/ui/base/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@herk/ui/base/select';
import { Switch } from '@herk/ui/base/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

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

      setOk('Policy updated.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
        <Switch
          id="fail-on-breaking"
          checked={failOnBreaking}
          onCheckedChange={(checked) => setFailOnBreaking(Boolean(checked))}
        />
        <Label htmlFor="fail-on-breaking">Fail check when breaking changes exist</Label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rule</TableHead>
            <TableHead>Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {RULES.map((rule) => (
            <TableRow key={rule.code}>
              <TableCell>{rule.title}</TableCell>
              <TableCell>
                <Select
                  value={ruleOverrides[rule.code]}
                  onValueChange={(value) => {
                    setRuleOverrides((current) => ({
                      ...current,
                      [rule.code]: value as PolicySeverity,
                    }));
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFF">OFF</SelectItem>
                    <SelectItem value="WARN">WARN</SelectItem>
                    <SelectItem value="BLOCK">BLOCK</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button type="button" onClick={onSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save policy'}
      </Button>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
