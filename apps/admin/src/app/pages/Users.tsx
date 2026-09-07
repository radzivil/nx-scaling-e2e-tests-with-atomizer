import { useMemo, useState } from 'react';
import { Badge, Button, Card, DataTable, EmptyState, type Column } from 'ui';
import { formatQuantity, percent } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { ROLES, type AdminUser, type Role } from '../data/seed';
import { useAdmin } from '../state/store';

const roleTone = (role: Role): 'neutral' | 'good' | 'warn' | 'bad' => {
  if (role === 'admin') return 'bad';
  if (role === 'editor') return 'warn';
  return 'neutral';
};

export function Users() {
  const { users, toggleUser, saving } = useAdmin();
  const loaded = useLoaded('users');
  const [role, setRole] = useState('all');
  const [onlyActive, setOnlyActive] = useState(false);

  const rows = useMemo(
    () => users.filter((u) => (role === 'all' || u.role === role) && (!onlyActive || u.active)),
    [users, role, onlyActive]
  );

  const activeCount = users.filter((u) => u.active).length;

  const columns: Column<AdminUser>[] = [
    { key: 'name', header: 'Name', render: (u) => <span data-cy="user-name">{u.name}</span> },
    { key: 'email', header: 'Email', render: (u) => <span data-cy="user-email">{u.email}</span> },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge tone={roleTone(u.role)} cy="user-role">
          {u.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <Badge tone={u.active ? 'good' : 'neutral'} cy="user-status">
          {u.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <Button
          variant={u.active ? 'danger' : 'primary'}
          data-cy="toggle-user"
          disabled={saving}
          onClick={() => toggleUser(u.id)}
        >
          {u.active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <section>
      <div className="page-head">
        <h1 data-cy="page-title">Users</h1>
      </div>

      {!loaded ? (
        <Loading />
      ) : (
        <Card cy="users-card">
          <div className="toolbar">
            <select data-cy="role-filter" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="checkbox">
              <input type="checkbox" data-cy="only-active" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
              Only active
            </label>
            <span className="muted" data-cy="user-count">
              {formatQuantity(rows.length, 'user')}
            </span>
            <span className="muted" data-cy="active-summary">
              {activeCount} of {users.length} active ({percent(activeCount, users.length)})
            </span>
          </div>

          {rows.length === 0 ? (
            <EmptyState message="No users match that filter." cy="no-users" />
          ) : (
            <DataTable columns={columns} rows={rows} rowKey={(u) => u.id} cy="users" />
          )}
        </Card>
      )}
    </section>
  );
}
