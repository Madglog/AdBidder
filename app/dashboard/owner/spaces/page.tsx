"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Eye, Edit, Trash2, MapPin, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { AdSpaceWithOwner } from "@/types";

export default function MySpacesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<AdSpaceWithOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      // In a real app, we'd filter by ownerId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/spaces?ownerId=${(session?.user as any)?.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this space?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/spaces/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Space deleted successfully",
        });
        fetchSpaces();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete space",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "destructive",
      PAUSED: "secondary",
      ACTIVE: "success",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Spaces</h1>
            <p className="text-muted-foreground">
              Manage your advertising spaces
            </p>
          </div>
          <Link href="/dashboard/owner/spaces/new">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add New Space
            </Button>
          </Link>
        </div>

        {spaces.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No spaces yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first advertising space
              </p>
              <Link href="/dashboard/owner/spaces/new">
                <Button>Add New Space</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {spaces.map((space) => (
              <Card key={space.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{space.title}</CardTitle>
                        {getStatusBadge(space.status)}
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {space.city}, {space.state}
                        </span>
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {space.type.replace(/_/g, " ")}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/owner/spaces/${space.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(space.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="text-lg font-semibold">
                        {space.width} × {space.height} {space.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-semibold flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(space.basePrice)}/{space.pricingUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Views</p>
                      <p className="text-lg font-semibold flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {space.viewCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bids</p>
                      <p className="text-lg font-semibold">
                        {space._count?.bids || 0}
                      </p>
                    </div>
                  </div>

                  {space.description && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                      {space.description}
                    </p>
                  )}

                  <div className="mt-4 flex justify-end space-x-2">
                    <Link href={`/spaces/${space.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Public Page
                      </Button>
                    </Link>
                    {space._count?.bids && space._count.bids > 0 ? (
                      <Link href={`/dashboard/owner/bids?spaceId=${space.id}`}>
                        <Button size="sm">
                          View {space._count.bids} Bid{space._count.bids !== 1 ? 's' : ''}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
