"use client"

import { Head, Link, router } from "@inertiajs/react"
import { Calendar, Clock, Edit, Plus, Trash, Terminal, Shield, Eye, FileCode, Lock, Search } from "lucide-react"
import { Fragment, useState } from "react"

import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: route('dashboard'),
  },
  {
    title: "Articles",
    href: route('articles.index'),
  },
]

export default function ArticlesIndex({ articles }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter articles based on search term
  const filteredArticles = articles.filter(
    (article) =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateArticle = () => {
    router.visit(route('articles.create'));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Articles" />

      <div className="p-4 md:p-6 flex flex-col space-y-6 bg-black/5 dark:bg-black/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-green-500" />
            <h1 className="text-2xl font-bold font-mono">Articles.list</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-black/20 border-neutral-700 focus-visible:ring-green-500"
              />
            </div>

            <Button 
              onClick={handleCreateArticle}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Create New Article</span>
            </Button>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-700 bg-black/20 p-8 text-center">
            <Terminal className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <h3 className="text-lg font-medium mb-2 font-mono">
              {searchTerm ? "No matching articles found" : "No articles found in database"}
            </h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm ? "Try a different search term" : "Initialize your first article to begin"}
            </p>
            <Button 
              onClick={handleCreateArticle}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Create New Article</span>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card
                key={article.uuid}
                className="flex flex-col border-neutral-800/50 bg-black/10 dark:bg-black/30 overflow-hidden hover:border-green-500/30 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 font-mono">
                      <Link
                        href={
                          article.status === "published"
                            ? route('articles.show', article.slug)
                            : route('articles.edit', article.uuid)
                        }
                        className="hover:text-green-500 transition-colors"
                      >
                        {article.title || "Untitled Article"}
                      </Link>
                    </CardTitle>
                    <Badge
                      variant={article.status === "published" ? "default" : "outline"}
                      className={
                        article.status === "published"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "border-amber-500 text-amber-500"
                      }
                    >
                      {article.status === "published" ? (
                        <Fragment>
                          <Eye className="h-3 w-3 mr-1" />
                          LIVE
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Lock className="h-3 w-3 mr-1" />
                          DRAFT
                        </Fragment>
                      )}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-xs gap-1 text-neutral-500">
                    {article.status === "published" && (
                      <Fragment>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      </Fragment>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-neutral-400 line-clamp-3 font-mono text-sm">
                    {article.content ? article.content.replace(/<[^>]*>/g, "").substring(0, 150) : "// No content yet"}
                  </p>
                </CardContent>

                <div className="px-6 py-2 bg-black/20 text-xs text-neutral-500 flex items-center font-mono">
                  <FileCode className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">article</span>.<span className="text-amber-500">stats</span>
                  <span className="mx-1">=</span>
                  <Clock className="h-3 w-3 mx-1" />
                  {article.reading_time} min read
                </div>

                <CardFooter className="flex justify-between border-t border-neutral-800/50 p-4 bg-black/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('articles.edit', article.uuid))}
                    className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300"
                      >
                        <Trash className="h-4 w-4 mr-1 text-red-500" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500 font-mono flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-red-500" />
                          WARNING: Destructive Action
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-mono">
                          This will permanently delete the article and all associated data.
                          <br />
                          <br />
                          <span className="text-red-500">This action cannot be undone.</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Link
                            href={route('articles.destroy', article.uuid)}
                            method="delete"
                            as="button"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </Link>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}