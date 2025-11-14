"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, DollarSign, MapPin, MessageSquare, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BidWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyBidsPage() {
  const { data: session } = useSession();
  const [bids, setBids] = useState<BidWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

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
            <CardDescription className="flex items-center space-x-2">
              <MapPin className="h-3 w-3" />
              <span>{bid.space.city}, {bid.space.state}</span>
              <span>•</span>
              <span>{bid.space.type.replace(/_/g, " ")}</span>
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
              Space Owner
            </div>
            <div className="text-sm font-medium">
              {bid.space.owner.name || bid.space.owner.email}
            </div>
          </div>
        </div>

        {bid.message && (
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Your Message
            </div>
            <div className="text-sm bg-muted p-3 rounded-md">
              {bid.message}
            </div>
          </div>
        )}

        {bid.counterAmount && bid.status === "COUNTERED" && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Counter Offer Received
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(bid.counterAmount)}
                </div>
                {bid.counterMessage && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    {bid.counterMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Link href={`/spaces/${bid.space.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Space
            </Button>
          </Link>
          {bid.status === "ACCEPTED" && (
            <Link href={`/dashboard/advertiser/campaigns/new?bidId=${bid.id}`}>
              <Button size="sm">
                Create Campaign
              </Button>
            </Link>
          )}
        </div>
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
  const counteredBids = filterBids("COUNTERED");
  const rejectedBids = filterBids("REJECTED");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bids</h1>
          <p className="text-muted-foreground">
            Track the status of your advertising space bids
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
            <TabsTrigger value="countered">
              Countered ({counteredBids.length})
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
                  <Link href="/dashboard/advertiser/search" className="mt-4">
                    <Button>Find Spaces to Bid On</Button>
                  </Link>
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
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No accepted bids yet</p>
                </CardContent>
              </Card>
            ) : (
              acceptedBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="countered" className="space-y-4">
            {counteredBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No counter offers</p>
                </CardContent>
              </Card>
            ) : (
              counteredBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
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
    </DashboardLayout>
  );
}
