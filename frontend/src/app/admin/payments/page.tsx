"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Zap,
  Crown,
  CheckCircle2,
  XCircle,
  Loader,
  Clock,
  Search,
  Filter,
  ArrowRight,
  User,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { adminAPI } from "@/lib/admin-api";
import Link from "next/link";

export default function PaymentApprovals() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ boosts: any[]; memberships: any[] }>({ boosts: [], memberships: [] });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPendingPayments();
      // res expected: { boosts: [...], memberships: [...] }
      setData((res as any) || { boosts: [], memberships: [] });
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast.error("Failed to load pending payments");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBoost = async (id: number) => {
    try {
      setProcessingId(id);
      await adminAPI.approveBoost(id);
      toast.success("Boost approved and activated");
      loadPayments();
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveMembership = async (id: number) => {
    try {
      setProcessingId(id);
      await adminAPI.approveMembership(id);
      toast.success("Membership approved and activated");
      loadPayments();
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const allItems = [
    ...data.boosts.map(b => ({ ...b, type: 'boost' })),
    ...data.memberships.map(m => ({ ...m, type: 'membership' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredItems = allItems.filter(item => 
    item.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.listing_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and activate pending listing boosts and membership subscriptions.</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-lg">
           <div className="px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Boosts</p>
              <p className="text-xl font-bold text-primary">{data.boosts.length}</p>
           </div>
           <div className="w-px h-8 bg-border" />
           <div className="px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Memberships</p>
              <p className="text-xl font-bold text-primary">{data.memberships.length}</p>
           </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user email, listing or plan..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadPayments} disabled={loading} className="gap-2">
              <Clock className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="gap-2">
                <Filter className="h-3.5 w-3.5" /> All Requests
              </TabsTrigger>
              <TabsTrigger value="boosts" className="gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Listing Boosts
              </TabsTrigger>
              <TabsTrigger value="memberships" className="gap-2">
                <Crown className="h-3.5 w-3.5 text-primary" /> Memberships
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Reconciling transactions...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-24 px-4 border-2 border-dashed rounded-2xl bg-muted/10">
                  <CheckCircle2 className="h-16 w-16 text-green-500/30 mx-auto mb-6" />
                  <h3 className="text-xl font-bold">Inbox items cleared</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    No pending approval requests found. All listing boosts and memberships are currently processed.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {(activeTab === 'all' ? filteredItems : filteredItems.filter(i => i.type === activeTab.slice(0, -1))).map((item) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="group relative bg-card border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                        {/* Summary Info */}
                        <div className="p-6 md:w-2/5 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={item.type === 'boost' ? 'bg-amber-500/5 text-amber-700 border-amber-200' : 'bg-primary/5 text-primary-700 border-primary-200'}>
                                {item.type === 'boost' ? <Zap className="h-3 w-3 mr-1" /> : <Crown className="h-3 w-3 mr-1" />}
                                {item.type === 'boost' ? 'Listing Boost' : 'Membership'}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" />
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                            
                            <div>
                               <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                  {item.type === 'boost' ? item.listing_title : item.plan_name}
                               </h3>
                               <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" />
                                  {item.user_email}
                               </p>
                            </div>
                          </div>

                          <div className="pt-6 flex items-center gap-2">
                             <div className="text-2xl font-black text-primary">BDT {item.amount || '0'}</div>
                             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">Manual Pay</div>
                          </div>
                        </div>

                        {/* Details & Actions */}
                        <div className="p-6 md:flex-1 bg-muted/5 flex flex-col justify-between gap-6">
                           <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Recipient Identity</p>
                                 <p className="text-sm font-medium">{item.user_full_name || 'Verified User'}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Duration</p>
                                 <p className="text-sm font-medium">{item.duration_days || item.days || 'N/A'} Days Validity</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-end gap-3 pt-4">
                             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2 h-10 px-4">
                               <XCircle className="h-4 w-4" /> Reject
                             </Button>
                             
                             <Button 
                                onClick={() => item.type === 'boost' ? handleApproveBoost(item.id) : handleApproveMembership(item.id)}
                                disabled={processingId === item.id}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 h-10 px-6 gap-2"
                             >
                                {processingId === item.id ? <Loader className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                Approve & Activate
                             </Button>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>

      <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-5">
        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
           <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div>
           <h4 className="text-lg font-bold text-blue-900">Automation Note</h4>
           <p className="text-sm text-blue-800/70 leading-relaxed mt-1">
              Currently, all financial transactions in MrBikeBD are verified manually. Staff must cross-reference the transaction ID (if provided) with the bank statement before clicking "Approve". Once approved, the platform automatically updates the user's status and boosts the visibility of their listings in the marketplace.
           </p>
        </div>
      </div>
    </div>
  );
}
