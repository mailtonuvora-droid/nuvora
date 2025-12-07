import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowRight, Bell, CheckCircle2, ShoppingBag, TrendingDown, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="bg-blue-600 text-white p-1 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
            Price Tracker AI
          </div>
          <nav className="flex gap-4">
            {/* Removed redundant Dashboard/Login link */}
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40">
                Login / Signup
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-32 lg:pb-28 bg-gradient-to-b from-blue-50 via-white to-white overflow-hidden relative">
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-wander"></div>

          {/* Floating Icons Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-[8%] text-blue-500 opacity-30 animate-wander-slow">
              <ShoppingBag className="h-12 w-12 md:h-16 md:w-16" />
            </div>
            <div className="absolute top-24 right-[12%] text-green-500 opacity-30 animate-wander-delayed">
              <div className="text-4xl md:text-5xl font-bold">$</div>
            </div>
            <div className="absolute bottom-1/4 left-[6%] text-purple-500 opacity-30 animate-wander">
              <Zap className="h-10 w-10 md:h-14 md:w-14" />
            </div>
            <div className="absolute top-1/3 right-[8%] text-orange-500 opacity-30 animate-wander-slow">
              <Bell className="h-10 w-10 md:h-12 md:w-12" />
            </div>
            <div className="absolute bottom-16 left-[18%] text-pink-500 opacity-30 animate-wander-delayed">
              <div className="text-3xl md:text-4xl font-bold">%</div>
            </div>
            <div className="absolute top-1/2 right-[20%] text-cyan-500 opacity-25 animate-wander">
              <TrendingDown className="h-10 w-10 md:h-12 md:w-12" />
            </div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center rounded-full border-2 border-blue-500 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                AI-Powered Price Tracking
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Never Miss a{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                    Price Drop
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                    <path d="M0 6C75 1 225 1 300 6C225 11 75 11 0 6Z" fill="url(#gradient)" opacity="0.6" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#9333EA" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="max-w-2xl text-gray-600 text-lg md:text-xl leading-relaxed">
                Track products from Amazon, Flipkart, and 100+ stores. Get instant alerts when prices drop. Save money effortlessly with AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-blue-500/40 rounded-full group">
                    Start Tracking Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Add Any Product</h3>
                    <p className="text-gray-600">Simply paste the product URL and we'll start tracking</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
                      <TrendingDown className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Real-Time Tracking</h3>
                    <p className="text-gray-600">AI monitors prices 24/7 across all major stores</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg">
                      <Bell className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Instant Alerts</h3>
                    <p className="text-gray-600">Get notified the moment prices drop below your target</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 mb-4">Why Choose Price Tracker AI?</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">We provide the most accurate and timely price tracking features to help you save more.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Real-time Updates</h3>
                <p className="text-gray-500">
                  Our advanced scraping engine checks prices frequently to ensure you never miss a deal.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Instant Notifications</h3>
                <p className="text-gray-500">
                  Receive alerts via email or push notification the second a price drops below your target.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Universal Support</h3>
                <p className="text-gray-500">
                  Works with Amazon, Flipkart, Myntra, and hundreds of other online retailers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            Price Tracker AI
          </div>
          <p className="text-sm text-gray-500">
            © 2024 Price Tracker AI. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors" href="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
