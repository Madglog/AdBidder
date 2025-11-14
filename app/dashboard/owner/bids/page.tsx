"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare, Calendar, DollarSign, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { BidWithDetails } from "@/types";

export default function BidsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bids, setBids] = useState<BidWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<BidWithDetails | null>(null);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBids(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/${bidId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bid accepted successfully",
        });
        fetchBids();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept bid",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!confirm("Are you sure you want to reject this bid?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/${bidId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bid rejected",
        });
        fetchBids();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject bid",
        variant: "destructive",
      });
    }
  };

  const handleCounterBid = async () => {
    if (!selectedBid) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/${selectedBid.id}/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({
          counterAmount: parseFloat(counterAmount),
          counterMessage,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Counter offer sent",
        });
        setShowCounterDialog(false);
        setSelectedBid(null);
        setCounterAmount("");
        setCounterMessage("");
        fetchBids();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send counter offer",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      PENDING: "warning",
      ACCEPTED: "success",
      REJECTED: "destructive",
      COUNTERED: "secondary",
      EXPIRED: "outline",
      CANCELLED: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  const filterBids = (status?: string) => {
    if (!status) return bids;
    return bids.filter(bid => bid.status === status);
  };

  const BidCard = ({ bid }: { bid: BidWithDetails }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{bid.space.title}</CardTitle>
              {getStatusBadge(bid.status)}
            </div>
            <CardDescription>
              From: {bid.advertiser.name || bid.advertiser.email}
              {bid.advertiser.businessName && ` (${bid.advertiser.businessName})`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(bid.amount)}
            </div>
            <div className="text-sm text-muted-foreground">
              for {bid.duration} days
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              Campaign Dates
            </div>
            <div className="text-sm font-medium">
              {formatDate(bid.startDate)} - {formatDate(bid.endDate)}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Building2 className="h-4 w-4 mr-1" />
              Space Location
            </div>
            <div className="text-sm font-medium">
              {bid.space.city}, {bid.space.state}
            </div>
          </div>
        </div>

        {bid.message && (
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </div>
            <div className="text-sm bg-muted p-3 rounded-md">
              {bid.message}
            </div>
          </div>
        )}

        {bid.counterAmount && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Your Counter Offer
            </div>
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(bid.counterAmount)}
            </div>
            {bid.counterMessage && (
              <div className="text-sm text-muted-foreground mt-2">
                {bid.counterMessage}
              </div>
            )}
          </div>
        )}

        {bid.status === "PENDING" && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              onClick={() => handleAcceptBid(bid.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBid(bid);
                setCounterAmount(bid.amount.toString());
                setShowCounterDialog(true);
              }}
              className="flex-1"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Counter
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectBid(bid.id)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pendingBids = filterBids("PENDING");
  const acceptedBids = filterBids("ACCEPTED");
  const rejectedBids = filterBids("REJECTED");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bids</h1>
          <p className="text-muted-foreground">
            Manage bids on your advertising spaces
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingBids.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedBids.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedBids.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({bids.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending bids</p>
                </CardContent>
              </Card>
            ) : (
              pendingBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Check className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No accepted bids</p>
                </CardContent>
              </Card>
            ) : (
              acceptedBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <X className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rejected bids</p>
                </CardContent>
              </Card>
            ) : (
              rejectedBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {bids.map(bid => <BidCard key={bid.id} bid={bid} />)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Counter Offer Dialog */}
      <Dialog open={showCounterDialog} onOpenChange={setShowCounterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Send a counter offer to the advertiser
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="counterAmount">Counter Amount ($)</Label>
              <Input
                id="counterAmount"
                type="number"
                step="0.01"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                placeholder="Enter your counter offer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="counterMessage">Message (Optional)</Label>
              <Textarea
                id="counterMessage"
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explain your counter offer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCounterBid}>
              Send Counter Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
