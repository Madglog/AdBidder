"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Calendar, Building2, Eye, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { CampaignWithDetails } from "@/types";

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      DRAFT: "outline",
      PENDING_PAYMENT: "warning",
      SCHEDULED: "secondary",
      ACTIVE: "success",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status.replace(/_/g, " ")}</Badge>;
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
            <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your advertising campaigns
            </p>
          </div>
          <Link href="/dashboard/advertiser/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Create your first campaign to start advertising
              </p>
              <div className="flex space-x-2">
                <Link href="/dashboard/advertiser/search">
                  <Button variant="outline">Find Spaces</Button>
                </Link>
                <Link href="/dashboard/advertiser/campaigns/new">
                  <Button>Create Campaign</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{campaign.title}</CardTitle>
                        {getStatusBadge(campaign.status)}
                      </div>
                      {campaign.description && (
                        <CardDescription>{campaign.description}</CardDescription>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(campaign.totalBudget)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Budget
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Campaign Dates
                      </div>
                      <div className="text-sm font-medium">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4 mr-1" />
                        Ad Spaces
                      </div>
                      <div className="text-sm font-medium">
                        {campaign._count?.spaces || 0} location{campaign._count?.spaces !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Megaphone className="h-4 w-4 mr-1" />
                        Status
                      </div>
                      <div className="text-sm font-medium">
                        {campaign.status.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>

                  {campaign.spaces && campaign.spaces.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Locations:</div>
                      <div className="space-y-2">
                        {campaign.spaces.slice(0, 3).map((campaignSpace) => (
                          <div
                            key={campaignSpace.id}
                            className="flex items-center justify-between p-2 bg-muted rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {campaignSpace.space.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {campaignSpace.space.city}, {campaignSpace.space.state}
                              </p>
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCurrency(campaignSpace.price)}
                            </div>
                          </div>
                        ))}
                        {campaign.spaces.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{campaign.spaces.length - 3} more location{campaign.spaces.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Link href={`/dashboard/advertiser/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {campaign.status === "DRAFT" && (
                      <Link href={`/dashboard/advertiser/campaigns/${campaign.id}/edit`}>
                        <Button size="sm">
                          Edit Campaign
                        </Button>
                      </Link>
                    )}
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
