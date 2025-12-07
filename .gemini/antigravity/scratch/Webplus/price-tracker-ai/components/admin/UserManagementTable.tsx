'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { createUser, resetUserPassword, updateUser } from "@/app/admin/users/actions";
import { Plus, RotateCcw, Pencil, Download, Users, Crown, UserCheck } from "lucide-react";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    mobile: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionEndDate: Date | null;
};

type FilterType = 'all' | 'free' | 'premium';

export default function UserManagementTable({ users }: { users: User[] }) {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [filter, setFilter] = useState<FilterType>('all');
    const [isPending, setIsPending] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [editTier, setEditTier] = useState("free");
    const [editPassword, setEditPassword] = useState("");

    // Filter users
    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        if (filter === 'free') return user.subscriptionTier === 'free';
        if (filter === 'premium') return user.subscriptionTier === 'premium';
        return true;
    });

    // Export to CSV/Excel
    function exportToExcel() {
        const headers = ['Name', 'Email', 'Mobile', 'Plan', 'Status', 'Expires'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                user.name || 'N/A',
                user.email || '',
                user.mobile || '',
                user.subscriptionTier,
                user.subscriptionStatus,
                user.subscriptionEndDate ? format(new Date(user.subscriptionEndDate), 'yyyy-MM-dd') : ''
            ].map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        toast.success('User data exported successfully!');
    }

    async function handleAddUser(formData: FormData) {
        setIsPending(true);
        const result = await createUser(formData);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setIsAddUserOpen(false);
        }
    }

    async function handleResetPassword() {
        if (!selectedUser) return;
        setIsPending(true);
        const result = await resetUserPassword(selectedUser.id, resetPasswordValue);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setIsResetPassOpen(false);
            setResetPasswordValue("");
            setSelectedUser(null);
        }
    }

    function openEditModal(user: User) {
        setSelectedUser(user);
        setEditName(user.name || "");
        setEditEmail(user.email || "");
        setEditMobile(user.mobile || "");
        setEditTier(user.subscriptionTier);
        setEditPassword("");
        setIsEditUserOpen(true);
    }

    async function handleUpdateUser() {
        if (!selectedUser) return;
        setIsPending(true);

        const result = await updateUser(selectedUser.id, {
            name: editName,
            email: editEmail,
            mobile: editMobile,
            subscriptionTier: editTier as 'free' | 'premium',
            password: editPassword || undefined,
        });

        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setIsEditUserOpen(false);
            setSelectedUser(null);
        }
    }

    return (
        <div className="space-y-4">
            {/* Header with filter tabs and actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-blue-600' : ''}
                    >
                        <Users className="h-4 w-4 mr-1" />
                        All Users ({users.length})
                    </Button>
                    <Button
                        variant={filter === 'free' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('free')}
                        className={filter === 'free' ? 'bg-zinc-600' : ''}
                    >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Free ({users.filter(u => u.subscriptionTier === 'free').length})
                    </Button>
                    <Button
                        variant={filter === 'premium' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('premium')}
                        className={filter === 'premium' ? 'bg-amber-500' : ''}
                    >
                        <Crown className="h-4 w-4 mr-1" />
                        Premium ({users.filter(u => u.subscriptionTier === 'premium').length})
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportToExcel}>
                        <Download className="h-4 w-4 mr-1" />
                        Export Excel
                    </Button>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add User</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                            </DialogHeader>
                            <form action={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input id="mobile" name="mobile" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" name="password" type="password" required minLength={6} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscriptionTier">Plan</Label>
                                    <Select name="subscriptionTier" defaultValue="free">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create User"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.mobile || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={user.subscriptionTier === "premium" ? "default" : "secondary"}
                                                className={user.subscriptionTier === "premium" ? "bg-amber-500" : ""}>
                                                {user.subscriptionTier}
                                            </Badge>
                                            {user.subscriptionTier === "premium" && (
                                                <span className={`text-xs ${user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {user.subscriptionStatus}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.subscriptionEndDate
                                            ? format(new Date(user.subscriptionEndDate), "PP")
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Pencil className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsResetPassOpen(true);
                                                }}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-1" /> Reset
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={isResetPassOpen} onOpenChange={setIsResetPassOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password for {selectedUser?.name || selectedUser?.email}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="text"
                                value={resetPasswordValue}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetPassOpen(false)}>Cancel</Button>
                        <Button onClick={handleResetPassword} disabled={isPending || !resetPasswordValue}>
                            {isPending ? "Resetting..." : "Confirm Reset"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User: {selectedUser?.name || selectedUser?.email}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-mobile">Mobile</Label>
                            <Input
                                id="edit-mobile"
                                value={editMobile}
                                onChange={(e) => setEditMobile(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-tier">Subscription Tier</Label>
                            <Select value={editTier} onValueChange={setEditTier}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="premium">Premium (30 days)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                            <Input
                                id="edit-password"
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Enter new password (optional)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser} disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
