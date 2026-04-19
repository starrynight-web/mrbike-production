"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Loader,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminAPI } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";

const STAFF_ROLES = [
  { value: "staff_news", label: "News Manager", description: "Can edit, add, and delete news articles" },
  { value: "staff_used_bikes", label: "Used Bike Moderator", description: "Can approve and manage used bike listings" },
  { value: "staff_bikes", label: "Inventory Manager", description: "Full access to official bike database" },
  { value: "staff_payments", label: "Payments Manager", description: "Can approve listings boosts and memberships" },
  { value: "staff_settings", label: "Site Administrator", description: "Can modify platform settings and appearance" },
];

export default function StaffManagement() {
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStaff, setNewStaff] = useState({
    email: "",
    role_key: "",
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStaff();
      setStaffList((data as any[]) || []);
    } catch (error) {
      console.error("Failed to load staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaff.email || !newStaff.role_key) {
      toast.error("Please provide both email and role");
      return;
    }

    try {
      await adminAPI.createStaff(newStaff);
      toast.success("Staff member added successfully");
      setShowAddModal(false);
      setNewStaff({ email: "", role_key: "" });
      loadStaff();
    } catch (error: any) {
      toast.error(error.message || "Failed to create staff");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      await adminAPI.deleteStaff(id);
      toast.success("Staff member removed");
      loadStaff();
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role_key?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Assign granular access permissions to your administrative team.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by email or role..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadStaff} disabled={loading}>
              <Loader className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Fetching staff list...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-20 px-4 border-2 border-dashed rounded-xl">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No staff found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "Try a different search term or check the full list."
                  : "Start by adding your first staff member to distribute management tasks."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-2 font-semibold">Staff Member</th>
                    <th className="text-left py-4 px-2 font-semibold">Role</th>
                    <th className="text-left py-4 px-2 font-semibold">Status</th>
                    <th className="text-right py-4 px-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <motion.tr
                      key={staff.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b hover:bg-muted/50 transition-colors group"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{staff.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: #{staff.id} • Assigned: {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : "Pending"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className="capitalize bg-accent/50">
                          {staff.role_key ? staff.role_key.replace("staff_", "").replace("_", " ") : "Assistant"}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        {staff.is_active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-xs font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs font-medium">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Add Staff Member</h3>
                    <p className="text-xs text-muted-foreground">Grant administrative privileges to a user.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      placeholder="user@example.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      User must already have an account on MrBikeBD.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" /> Security Role
                    </Label>
                    <Select
                      onValueChange={(val) => setNewStaff({ ...newStaff, role_key: val })}
                      value={newStaff.role_key}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{role.label}</span>
                              <span className="text-[10px] text-muted-foreground">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Important Note</h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                      Assigned staff will NOT have access to the Django Admin panel. They will only be able to access specific tools within this custom dashboard based on their role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={handleCreateStaff}>
                  <UserCheck className="h-4 w-4" />
                  Confirm Access
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
