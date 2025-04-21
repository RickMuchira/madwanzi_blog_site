"use client"

import { Head, Link } from "@inertiajs/react"
import { ArrowLeft, Calendar, Clock, Share, Terminal, Eye, Link2, User } from "lucide-react"

import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ArticleShow({ article, author }) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not yet published"

  const handleShare = (platform) => {
    const url = window.location.href
    const title = article.title

    let shareUrl

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copied",
            description: "Article link copied to clipboard",
          })
        })
        return
      default:
        return
    }

    window.open(shareUrl, "_blank")
  }

  return (
    <AppLayout>
      <Head title={article.title || "Article"} />

      <div className="container mx-auto max-w-4xl p-6 bg-black/5 dark:bg-black/20 min-h-screen">
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300"
          >
            <Link href="/articles">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Articles
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer hover:bg-neutral-800">
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer hover:bg-neutral-800">
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer hover:bg-neutral-800">
                Share on LinkedIn
              </DropdownMenuItem>
              <Separator className="my-1 bg-neutral-700" />
              <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer hover:bg-neutral-800">
                <Link2 className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Terminal className="h-5 w-5 text-green-500" />
              <span className="text-sm font-mono text-green-500">article.view</span>
              <Badge className="bg-green-600 text-white hover:bg-green-700 ml-2">
                <Eye className="h-3 w-3 mr-1" />
                PUBLISHED
              </Badge>
            </div>

            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl font-mono">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-neutral-500">
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10 border-2 border-green-500/30">
                  <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                  <AvatarFallback className="bg-black text-green-500">
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm">{author.name}</span>
                  <div className="text-xs text-green-500 font-mono">
                    @{author.name.toLowerCase().replace(/\s/g, "")}
                  </div>
                </div>
              </div>

              <span className="h-4 border-l border-neutral-700 hidden sm:block"></span>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">{formattedDate}</span>
              </div>

              <span className="h-4 border-l border-neutral-700 hidden sm:block"></span>

              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{article.reading_time} min read</span>
              </div>
            </div>
          </header>

          <ScrollArea className="max-h-[70vh]">
            <div className="prose prose-invert prose-green prose-headings:font-mono prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-img:rounded-lg prose-code:text-green-500 prose-pre:bg-black/50 prose-pre:border prose-pre:border-green-900/50 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </ScrollArea>

          <Separator className="my-8 bg-neutral-800" />

          <div className="bg-black/30 border border-green-900/30 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-green-500/30">
                <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                <AvatarFallback className="bg-black text-green-500">
                  {author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium font-mono flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-green-500">author</span>: {author.name}
                </h3>
                <p className="text-neutral-500">
                  <span className="text-green-500 font-mono">articles.count</span>:{" "}
                  {author.articles_count || "multiple"}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </AppLayout>
  )
}
