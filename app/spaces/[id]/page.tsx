"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Eye, Star, DollarSign, Ruler, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { AdSpaceWithOwner } from "@/types";

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [space, setSpace] = useState<AdSpaceWithOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSpace(params.id as string);
    }
  }, [params.id]);

  const fetchSpace = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/spaces/${id}`);
      const data = await response.json();
      if (data.success) {
        setSpace(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch space:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Space not found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              The advertising space you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/spaces">
              <Button>Browse All Spaces</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgRating = space.reviews && space.reviews.length > 0
    ? space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link href="/">
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">AdBidder</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Image Gallery */}
            {space.photos && space.photos.length > 0 && (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img
                    src={space.photos[0]}
                    alt={space.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {space.photos.length > 1 && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {space.photos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="aspect-video bg-muted rounded overflow-hidden">
                          <img
                            src={photo}
                            alt={`${space.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-2xl">{space.title}</CardTitle>
                      {space.instantBook && (
                        <Badge variant="success">INSTANT BOOK</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {space.address}, {space.city}, {space.state} {space.zipCode}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {space.viewCount} views
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{space.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      Type
                    </div>
                    <div className="text-lg font-semibold">
                      {space.type.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Ruler className="h-4 w-4 mr-1" />
                      Dimensions
                    </div>
                    <div className="text-lg font-semibold">
                      {space.width} × {space.height} {space.unit}
                    </div>
                  </div>

                  {space.visibilityScore && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Star className="h-4 w-4 mr-1" />
                        Visibility Score
                      </div>
                      <div className="text-lg font-semibold">
                        {space.visibilityScore}/10
                      </div>
                    </div>
                  )}

                  {space.trafficEstimate && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Daily Traffic
                      </div>
                      <div className="text-lg font-semibold">
                        {space.trafficEstimate.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {space.reviews && space.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({space.reviews.length})</CardTitle>
                  {avgRating > 0 && (
                    <CardDescription className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {avgRating.toFixed(1)} average rating
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {space.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{review.reviewer.name}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-primary">
                  {formatCurrency(space.basePrice)}
                </CardTitle>
                <CardDescription>
                  per {space.pricingUnit}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {space.minBidPrice && (
                  <div className="text-sm text-muted-foreground">
                    Minimum bid: {formatCurrency(space.minBidPrice)}
                  </div>
                )}

                {session ? (
                  <div className="space-y-2">
                    {space.instantBook && (
                      <Button className="w-full" size="lg">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Book Instantly
                      </Button>
                    )}
                    <Link href={`/dashboard/advertiser/search?spaceId=${space.id}`}>
                      <Button variant="outline" className="w-full" size="lg">
                        Place a Bid
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/register?role=advertiser">
                      <Button className="w-full" size="lg">
                        Sign Up to Bid
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Space Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{space.owner.name}</div>
                  {space.owner.businessName && (
                    <div className="text-sm text-muted-foreground">
                      {space.owner.businessName}
                    </div>
                  )}
                  {session && (
                    <Button variant="outline" className="w-full mt-4">
                      Contact Owner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{space.viewCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Bids</span>
                  <span className="font-semibold">{space._count?.bids || 0}</span>
                </div>
                {space._count?.reviews && space._count.reviews > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{space._count.reviews}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
