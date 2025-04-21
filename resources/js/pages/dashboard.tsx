import { Head } from "@inertiajs/react"
import { Terminal, Code, Shield, Cpu, Zap, BarChart2, Eye, Clock, FileCode } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react";



const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
]

export default function Dashboard() {
  // Mock data for dashboard stats
  const stats = [
    { title: "Total Articles", value: "12", icon: FileCode, color: "from-emerald-500 to-green-500" },
    { title: "Total Views", value: "2.4k", icon: Eye, color: "from-cyan-500 to-blue-500" },
    { title: "Avg. Read Time", value: "4m", icon: Clock, color: "from-violet-500 to-purple-500" },
  ]

  // Mock data for recent activity
  const recentActivity = [
    { action: "Published article", title: "Breaking the Firewall: A Deep Dive", time: "2 hours ago" },
    { action: "Updated article", title: "Zero-Day Exploits Explained", time: "1 day ago" },
    { action: "Started draft", title: "Quantum Computing Threats", time: "3 days ago" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 bg-black/5 dark:bg-black/20">
        {/* Terminal-like welcome message */}
        <Card className="border-green-500/30 bg-black/20 text-green-500 dark:bg-black/40 overflow-hidden">
          <CardContent className="p-4 font-mono">
            <div className="flex items-center space-x-2 mb-2 border-b border-green-500/20 pb-2">
              <Terminal className="h-5 w-5" />
              <span className="text-sm">system@hackersblog:~$</span>
            </div>
            <div className="typewriter">
              <p className="text-sm">
                Welcome back, user. System status: <span className="text-green-400">online</span>
              </p>
              <p className="text-sm mt-1">Last login: {new Date().toLocaleString()}</p>
              <p className="text-sm mt-3">Ready to share your knowledge with the world?</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button asChild variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-500/10">
                <Link href="/articles/create">
                  <Code className="mr-2 h-4 w-4" />
                  New Article
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-500/10">
                <Link href="/articles">
                  <FileCode className="mr-2 h-4 w-4" />
                  View Articles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="border-neutral-800/50 bg-black/10 dark:bg-black/30 overflow-hidden">
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.color}`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Security Status */}
          <Card className="border-neutral-800/50 bg-black/10 dark:bg-black/30 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">SSL Certificate</span>
                  <span className="text-xs text-green-500">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">2FA</span>
                  <span className="text-xs text-green-500">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Last Backup</span>
                  <span className="text-xs">12 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <Card className="border-neutral-800/50 bg-black/10 dark:bg-black/30 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">System Resources</CardTitle>
              <Cpu className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">CPU</span>
                    <span className="text-xs">24%</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Memory</span>
                    <span className="text-xs">42%</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Storage</span>
                    <span className="text-xs">67%</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "67%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-neutral-800/50 bg-black/10 dark:bg-black/30 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500"></div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium">{activity.action}</p>
                      <p className="text-xs text-neutral-500">{activity.title}</p>
                      <p className="text-xs text-neutral-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Analytics */}
        <Card className="border-neutral-800/50 bg-black/10 dark:bg-black/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Traffic Analytics</CardTitle>
            <BarChart2 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-end justify-between space-x-2">
              {[40, 25, 35, 60, 45, 75, 55].map((height, index) => (
                <div key={index} className="relative h-full flex-1">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-sm opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
