import { Head, Link } from "@inertiajs/react"
import { ArrowLeft, Calendar, Clock, Edit, Terminal, Eye, Shield } from "lucide-react"

import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ArticlePreview({ article, author, isPreview = true }) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not yet published"

  return (
    <AppLayout>
      <Head title={article.title || "Article Preview"} />

      {isPreview && (
        <div className="bg-amber-900/30 border-b border-amber-700/50 p-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-amber-500 font-mono">PREVIEW MODE ACTIVE</span>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-amber-700 bg-black/20 hover:bg-black/40 text-amber-400"
            >
              <Link href={`/articles/${article.uuid}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Return to Editor
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl p-6 bg-black/5 dark:bg-black/20 min-h-screen">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-neutral-700 bg-black/20 hover:bg-black/40 text-neutral-300"
          >
            <Link href={isPreview ? `/articles/${article.uuid}/edit` : "/articles"}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {isPreview ? "Back to Editor" : "Back to Articles"}
            </Link>
          </Button>
        </div>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Terminal className="h-5 w-5 text-green-500" />
              <span className="text-sm font-mono text-green-500">article.view</span>
              {isPreview && (
                <Badge variant="outline" className="border-amber-500 text-amber-500 ml-2">
                  <Eye className="h-3 w-3 mr-1" />
                  PREVIEW
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl font-mono">
              {article.title || "Untitled Article"}
            </h1>

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
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p className="text-neutral-500 italic font-mono">// No content yet</p>
              )}
            </div>
          </ScrollArea>
        </article>
      </div>
    </AppLayout>
  )
}
