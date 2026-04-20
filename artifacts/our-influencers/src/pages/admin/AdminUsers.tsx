import { useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  useOiListUsers, useOiCreateUser, useOiUpdateUser, useOiDeleteUser,
  getOiListUsersQueryKey,
} from "@workspace/api-client-react";
import type { OiUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Edit2, Trash2, UserCog, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<OiUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({
    email: "", password: "", fullName: "", role: "client", companyName: "", phone: "",
  });
  const [editForm, setEditForm] = useState({
    email: "", fullName: "", companyName: "", phone: "", password: "",
  });

  const { data: users = [], isLoading } = useOiListUsers({
    query: { queryKey: getOiListUsersQueryKey() },
  });

  const createMutation = useOiCreateUser();
  const updateMutation = useOiUpdateUser();
  const deleteMutation = useOiDeleteUser();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getOiListUsersQueryKey() });

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.companyName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({
        data: {
          email: createForm.email,
          password: createForm.password,
          fullName: createForm.fullName,
          role: createForm.role as "admin" | "client",
          companyName: createForm.companyName || null,
          phone: createForm.phone || null,
        },
      });
      invalidate();
      setCreateOpen(false);
      setCreateForm({ email: "", password: "", fullName: "", role: "client", companyName: "", phone: "" });
      toast({ title: "Account created successfully" });
    } catch (e: any) {
      toast({ title: e?.message ?? "Failed to create account", variant: "destructive" });
    }
  }

  function openEdit(user: OiUser) {
    setEditUser(user);
    setEditForm({ email: user.email, fullName: user.fullName, companyName: user.companyName ?? "", phone: user.phone ?? "", password: "" });
  }

  async function handleUpdate() {
    if (!editUser) return;
    try {
      const data: any = {
        email: editForm.email,
        fullName: editForm.fullName,
        companyName: editForm.companyName || null,
        phone: editForm.phone || null,
      };
      if (editForm.password) data.password = editForm.password;
      await updateMutation.mutateAsync({ id: editUser.id, data });
      invalidate();
      setEditUser(null);
      toast({ title: "Account updated" });
    } catch {
      toast({ title: "Failed to update account", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      invalidate();
      setDeleteConfirm(null);
      toast({ title: "Account deleted" });
    } catch {
      toast({ title: "Failed to delete account", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage admin and client user accounts</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Create Account
          </Button>
        </div>

        <div className="relative max-w-xs mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UserCog className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No accounts found
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => (
              <Card key={u.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {u.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{u.fullName}</p>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">{u.role}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{u.email}</span>
                        {u.companyName && (
                          <span className="flex items-center gap-0.5"><Building2 className="w-3 h-3" /> {u.companyName}</span>
                        )}
                        {u.phone && <span>{u.phone}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(u.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Jane Doe" value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@company.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="Set a secure password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Company (optional)</Label>
                <Input placeholder="Acme Corp" value={createForm.companyName} onChange={e => setCreateForm(f => ({ ...f, companyName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone (optional)</Label>
                <Input placeholder="+1 555 000 0000" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!createForm.email || !createForm.password || !createForm.fullName || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editUser !== null} onOpenChange={o => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Account — {editUser?.fullName}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>New Password (leave blank to keep current)</Label>
              <Input type="password" placeholder="New password..." value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={editForm.companyName} onChange={e => setEditForm(f => ({ ...f, companyName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Account?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the account and cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
