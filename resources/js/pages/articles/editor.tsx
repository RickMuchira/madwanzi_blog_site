"use client"

import type React from "react"
import { Head, Link, router, useForm, usePage } from "@inertiajs/react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  ImageIcon,
  Save,
  Upload,
  FileImage,
  CalendarDays,
} from "lucide-react"
import { useCallback, useState, useRef, useEffect } from "react"
import debounce from "lodash/debounce"
import axios from "axios"
import DOMPurify from "dompurify"

import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "@/components/tiptap/rich-text-editor"
import { htmlToPlainText } from "@/lib/tiptap-utils"
import { Editor as TiptapEditor } from '@tiptap/react'

// Define types for props and article
interface ArticleData {
  id: number;
  uuid: string;
  title: string;
  content: string;
  status: string;
  word_count: number;
  reading_time: number;
  slug: string;
}

interface EditorProps {
  article: ArticleData;
  isNewArticle: boolean;
}

export default function Editor({ article, isNewArticle }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(article.word_count || 0);
  const [readingTime, setReadingTime] = useState(article.reading_time || 0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreviewLink, setShowPreviewLink] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Breadcrumb items for navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { title: "Dashboard", href: route("dashboard") },
    { title: "Articles", href: route("articles.index") },
    { title: isNewArticle ? "New Article" : "Edit Article", href: "#" },
  ];

  // Setup form with Inertia
  const { data, setData, errors } = useForm<{
    uuid: string;
    title: string;
    content: string;
  }>({
    uuid: article.uuid,
    title: article.title || '',
    content: article.content || '',
  });

  const debouncedSaveTitle = useCallback(
    debounce(async (title: string) => {
      try {
        setIsSaving(true);
        const response = await axios.patch(`/articles/${article.uuid}/title`, {
          uuid: article.uuid,
          title,
        });
        setIsSaving(false);
        toast({
          title: "Success",
          description: "Title saved successfully",
        });
      } catch (error) {
        setIsSaving(false);
        console.error('Error saving title:', error);
        toast({
          title: "Error",
          description: "Failed to save title",
          variant: "destructive",
        });
      }
    }, 1000),
    [article.uuid]
  );

  // Save article content with debounce
  const debouncedSaveContent = useCallback(
    debounce(async (content: string) => {
      try {
        setIsSaving(true);
        const response = await axios.patch(`/articles/${article.uuid}/content`, {
          uuid: article.uuid,
          content,
        });
        
        if (response.data.success) {
          setWordCount(response.data.word_count);
          setReadingTime(response.data.reading_time);
        }
        
        setIsSaving(false);
        toast({
          title: "Success",
          description: "Content saved",
        });
      } catch (error) {
        setIsSaving(false);
        console.error('Error saving content:', error);
        toast({
          title: "Error",
          description: "Failed to save content",
          variant: "destructive",
        });
      }
    }, 1000),
    [article.uuid]
  );

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setData('title', newTitle);
    debouncedSaveTitle(newTitle);
  };

  // Handle content change (from TipTap)
  const handleContentChange = (content: string) => {
    setData('content', content);
    debouncedSaveContent(content);
  };

  // Generate preview link
  const handleGeneratePreview = async () => {
    try {
      const response = await axios.post('/articles/preview', {
        uuid: article.uuid,
      });
      
      if (response.data.preview_url) {
        setPreviewUrl(response.data.preview_url);
        setShowPreviewLink(true);
        window.open(response.data.preview_url, '_blank');
        
        toast({
          title: "Preview Ready",
          description: "Article preview has been generated",
        });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive",
      });
    }
  };

  // Schedule article for future publication
  const handleScheduleArticle = async () => {
    if (!data.title.trim() || !data.content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please add a title and content before scheduling",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "Missing Date",
        description: "Please select a publication date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a date object from the selected date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Check if the date is valid and in the future
      if (isNaN(scheduledDateTime.getTime()) || scheduledDateTime <= new Date()) {
        toast({
          title: "Invalid Date",
          description: "Please select a date and time in the future",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(`/articles/${article.uuid}/schedule`, {
        uuid: article.uuid,
        scheduled_at: scheduledDateTime.toISOString(),
      });
      
      if (response.data.success) {
        setShowScheduleDialog(false);
        toast({
          title: "Article Scheduled",
          description: response.data.message || "Your article has been scheduled for publication",
        });
        // Redirect to the articles index page
        router.visit(route('articles.index'));
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to schedule article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scheduling article:', error);
      toast({
        title: "Error",
        description: "Failed to schedule article",
        variant: "destructive",
      });
    }
  };

  // Publish article
  const handlePublish = async () => {
    if (!data.title.trim() || !data.content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please add a title and content before publishing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      
      // Add a debug toast
      toast({
        title: "Publishing...",
        description: "Sending request to publish article",
      });
      
      const response = await axios.post(`/articles/${article.uuid}/publish`, {
        uuid: article.uuid,
      });
      
      console.log("Publish response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Published",
          description: "Your article has been published successfully",
        });
        
        // Add a short delay before navigation
        setTimeout(() => {
          // Navigate to the published article
          if (response.data.article_url) {
            window.location.href = response.data.article_url;
          } else {
            // Fallback to articles list
            window.location.href = route('articles.index');
          }
        }, 500);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to publish article",
          variant: "destructive",
        });
        setIsPublishing(false);
      }
    } catch (error: any) {
      console.error('Error publishing article:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish article",
        variant: "destructive",
      });
      setIsPublishing(false);
    }
  };

  // Get tomorrow's date in YYYY-MM-DD format for the date input min value
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <AppLayout breadcrumbs={breadcrumbItems}>
      <Head title={data.title || 'New Article'} />

      <div className="container mx-auto py-6">
        {/* Header section with actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href={route('articles.index')} className="mr-2">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {isNewArticle ? 'Create Article' : 'Edit Article'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Save className="w-4 h-4 mr-1 animate-pulse" />
                Saving...
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGeneratePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            {/* Schedule Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowScheduleDialog(true)}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            
            {/* Publish Button */}
            <Button 
              variant="default" 
              size="sm" 
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </div>

        {/* Schedule dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Publication</DialogTitle>
              <DialogDescription>
                Choose when you want this article to be automatically published.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="schedule-date" className="text-sm font-medium">
                  Publication Date
                </label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getTomorrowDateString()}
                  className="w-full"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="schedule-time" className="text-sm font-medium">
                  Publication Time
                </label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {scheduledDate && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Your article will be published on <strong>{scheduledDate}</strong> at <strong>{scheduledTime}</strong>.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleScheduleArticle} disabled={!scheduledDate}>
                Schedule Publication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview link */}
        {showPreviewLink && (
          <div className="mb-6 p-4 bg-muted rounded-md border">
            <p className="text-sm flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Preview available at: <a href={previewUrl} target="_blank" className="ml-2 text-primary underline">{previewUrl}</a>
            </p>
          </div>
        )}

        {/* Title input */}
        <div className="mb-6">
          <Input
            type="text"
            value={data.title}
            onChange={handleTitleChange}
            placeholder="Article Title"
            className="text-3xl font-bold h-14 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
          <Separator className="mt-2" />
        </div>

        {/* TipTap Rich Text Editor */}
        <div className="mb-6">
          <RichTextEditor
            initialContent={data.content}
            onUpdate={handleContentChange}
            onStatsUpdate={({ wordCount, readingTime }) => {
              setWordCount(wordCount);
              setReadingTime(readingTime);
            }}
            onEditorReady={(editorInstance) => setEditor(editorInstance)}
            articleUuid={article.uuid} // Pass the article UUID to RichTextEditor
          />
        </div>

        {/* Word count and reading time */}
        <div className="mb-6 flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{wordCount} words · {readingTime} min read</span>
        </div>
      </div>
    </AppLayout>
  );
}