import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Pencil,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ROLE_LABELS = {
  admin: 'Admin',
  attorney: 'Attorney',
  intake_staff: 'Intake Staff',
  case_manager: 'Case Manager',
};

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  attorney: 'bg-blue-100 text-blue-800',
  intake_staff: 'bg-green-100 text-green-800',
  case_manager: 'bg-amber-100 text-amber-800',
};

const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'intake_staff' };

export default function UserManagement() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const isAdmin = me?.role === 'admin';

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);  // user object being edited
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({ role: '', full_name: '' });
  const [formError, setFormError] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => apiClient.staffUsers.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.staffUsers.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('User created');
      setInviteOpen(false);
      setForm(EMPTY_FORM);
      setFormError('');
    },
    onError: (err) => {
      setFormError(err?.data?.message ?? 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.staffUsers.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('User updated');
      setEditUser(null);
    },
    onError: (err) => {
      toast.error(err?.data?.message ?? 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.staffUsers.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('User removed');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err?.data?.message ?? 'Failed to delete user');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setFormError('');
    createMutation.mutate(form);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ full_name: u.full_name, role: u.role });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editUser.id, data: editForm });
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage staff accounts and roles</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setInviteOpen(true); setForm(EMPTY_FORM); setFormError(''); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No staff users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                {isAdmin && <th className="px-5 py-3 w-24" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {u.full_name?.charAt(0) ?? '?'}
                      </div>
                      <span className="font-medium text-slate-900">
                        {u.full_name}
                        {u.id === me?.id && (
                          <span className="ml-2 text-xs text-slate-400">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-700'}`}>
                      {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {u.id !== me?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add staff user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8}
                required
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake_staff">Intake Staff</SelectItem>
                  <SelectItem value="case_manager">Case Manager</SelectItem>
                  <SelectItem value="attorney">Attorney</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{formError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create user'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user — {editUser?.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake_staff">Intake Staff</SelectItem>
                  <SelectItem value="case_manager">Case Manager</SelectItem>
                  <SelectItem value="attorney">Attorney</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account. Any cases or intakes assigned to them will remain but lose the assignee reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing…' : 'Remove user'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
