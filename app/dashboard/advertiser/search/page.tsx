"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Building2, Eye, Star, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AdSpaceWithOwner } from "@/types";

const AD_SPACE_TYPES = [
  "ALL",
  "BILLBOARD",
  "WALL_WRAP",
  "KIOSK",
  "TRANSIT_SHELTER",
  "DIGITAL_SCREEN",
  "ROOFTOP",
  "VEHICLE_WRAP",
  "OTHER",
];

export default function SearchSpacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<AdSpaceWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<AdSpaceWithOwner | null>(null);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    type: "ALL",
    minPrice: "",
    maxPrice: "",
  });
  const [bidData, setBidData] = useState({
    amount: "",
    duration: "30",
    startDate: "",
    endDate: "",
    message: "",
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.state) params.append("state", filters.state);
      if (filters.type && filters.type !== "ALL") params.append("type", filters.type);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spaces?${params.toString()}`
      );
      const data = await response.json();
      if (data.success) {
        setSpaces(data.data.spaces || []);
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedSpace) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          amount: parseFloat(bidData.amount),
          duration: parseInt(bidData.duration),
          startDate: bidData.startDate,
          endDate: bidData.endDate,
          message: bidData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place bid");
      }

      toast({
        title: "Success",
        description: "Your bid has been submitted!",
      });

      setShowBidDialog(false);
      setSelectedSpace(null);
      setBidData({
        amount: "",
        duration: "30",
        startDate: "",
        endDate: "",
        message: "",
      });

      router.push("/dashboard/advertiser/bids");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    }
  };

  const openBidDialog = (space: AdSpaceWithOwner) => {
    setSelectedSpace(space);
    setBidData(prev => ({
      ...prev,
      amount: space.basePrice.toString(),
    }));
    setShowBidDialog(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Ad Spaces</h1>
          <p className="text-muted-foreground">
            Browse and bid on premium outdoor advertising locations
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_SPACE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "ALL" ? "All Types" : type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={fetchSpaces}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {spaces.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No spaces found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                {space.photos && space.photos[0] && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={space.photos[0]}
                      alt={space.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{space.title}</CardTitle>
                    {space.instantBook && (
                      <Badge variant="success" className="ml-2 shrink-0">INSTANT</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {space.city}, {space.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{space.type.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{space.width}×{space.height} {space.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium flex items-center">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(space.basePrice)}/{space.pricingUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {space.viewCount}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {space.description}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/spaces/${space.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => openBidDialog(space)}
                    >
                      Place Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bid Dialog */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              {selectedSpace && `Bidding on: ${selectedSpace.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Bid Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={bidData.amount}
                  onChange={(e) => setBidData({ ...bidData, amount: e.target.value })}
                  required
                />
                {selectedSpace && (
                  <p className="text-xs text-muted-foreground">
                    Base price: {formatCurrency(selectedSpace.basePrice)}/{selectedSpace.pricingUnit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={bidData.duration}
                  onChange={(e) => setBidData({ ...bidData, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={bidData.startDate}
                  onChange={(e) => setBidData({ ...bidData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={bidData.endDate}
                  onChange={(e) => setBidData({ ...bidData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={bidData.message}
                onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                placeholder="Add any notes about your campaign..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBidDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBid}>
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
