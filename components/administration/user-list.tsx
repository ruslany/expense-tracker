'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, Trash2, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface UserListProps {
  users: User[];
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add user');
      }

      onOpenChange(false);
      setEmail('');
      setRole('reader');
      toast.success('User added successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add user';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Add a new user who can sign in to the app.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reader">Reader</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Readers can view all data. Admins can also create, edit, delete, and import.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? 'Adding...' : 'Add user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      onOpenChange(false);
      toast.success('User removed successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{user?.email}</strong>? They will no longer be
            able to sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(message);
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardAction>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus />
              Add User
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No users found.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{user.email}</span>
                          <RoleBadge role={user.role} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(user, user.role === 'admin' ? 'reader' : 'admin')
                              }
                            >
                              <Shield />
                              {user.role === 'admin' ? 'Make Reader' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(user)}
                            >
                              <Trash2 />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(user.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(
                                    user,
                                    user.role === 'admin' ? 'reader' : 'admin',
                                  )
                                }
                              >
                                <Shield />
                                {user.role === 'admin' ? 'Make Reader' : 'Make Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(user)}
                              >
                                <Trash2 />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddUserDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
      />
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
      {role === 'admin' ? 'Admin' : 'Reader'}
    </Badge>
  );
}
