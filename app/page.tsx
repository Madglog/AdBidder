import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Search,
  DollarSign
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AdBidder</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Outdoor Advertising Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with premium outdoor advertising spaces. List your spaces or find the perfect location for your next campaign through our intelligent bidding platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register?role=advertiser">
              <Button size="lg" className="text-lg">
                <Search className="mr-2 h-5 w-5" />
                Find Ad Spaces
              </Button>
            </Link>
            <Link href="/auth/register?role=owner">
              <Button size="lg" variant="outline" className="text-lg">
                <DollarSign className="mr-2 h-5 w-5" />
                List Your Space
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AdBidder?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-muted-foreground">
                Access thousands of premium outdoor advertising spaces in high-traffic locations worldwide.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Bidding</h3>
              <p className="text-muted-foreground">
                Competitive bidding system that ensures fair pricing and maximizes ROI for both parties.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with escrow system and automated payouts via Stripe.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Instant notifications for bids, bookings, and campaign updates through our live platform.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
              <p className="text-muted-foreground">
                Filter by location, type, budget, and audience reach with our interactive map interface.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-muted-foreground">
                No hidden fees. Clear pricing structure with detailed analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of advertisers and space owners already using AdBidder
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AdBidder</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting advertisers with premium outdoor advertising spaces.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/spaces">Browse Spaces</Link></li>
                <li><Link href="/auth/register">Sign Up</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AdBidder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
