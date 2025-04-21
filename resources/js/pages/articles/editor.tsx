"use client"

import type React from "react"
import { Head, Link, router, useForm, usePage } from "@inertiajs/react"
import {
  ArrowLeft,
  Clock,
  Eye,
  ImageIcon,
  Save,
  Upload,
  Code,
  Terminal,
  Link2,
  List,
  ListOrdered,
  Quote,
  Braces,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  FileImage,
} from "lucide-react"
import { useCallback, useState, useRef, useEffect } from "react"
import debounce from "lodash/debounce"
import axios from "axios"
import DOMPurify from "dompurify"
import { marked } from "marked"

import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  mime_type: string;
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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Breadcrumb items for navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Articles", href: route("articles.index") },
    { label: isNewArticle ? "New Article" : "Edit Article", href: "#" },
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

  // Load article media on mount
  useEffect(() => {
    if (article.uuid) {
      fetchArticleMedia();
    }
  }, [article.uuid]);

  // Fetch media attached to this article
  const fetchArticleMedia = async () => {
    try {
      const response = await axios.get(`/api/articles/${article.uuid}/media`);
      if (response.data.success) {
        setMedia(response.data.media);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    }
  };

  // Save article title with debounce
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

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setData('content', newContent);
    debouncedSaveContent(newContent);
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
      const response = await axios.post(`/articles/${article.uuid}/publish`, {
        uuid: article.uuid,
      });
      
      if (response.data.success) {
        toast({
          title: "Published",
          description: "Your article has been published successfully",
        });
        router.visit(response.data.article_url);
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      toast({
        title: "Error",
        description: "Failed to publish article",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('article_uuid', article.uuid);

    try {
      setUploading(true);
      const response = await axios.post('/articles/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setMedia([...media, response.data.media]);
        toast({
          title: "Upload Complete",
          description: "Image uploaded successfully",
        });
      }
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  // Insert text at cursor position
  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setData('content', newText);
    debouncedSaveContent(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + textToInsert.length;
      textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  // Insert markdown formatting
  const insertMarkdown = (type: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let textToInsert = '';
    
    switch (type) {
      case 'bold':
        textToInsert = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        textToInsert = `*${selectedText || 'italic text'}*`;
        break;
      case 'h1':
        textToInsert = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        textToInsert = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'h3':
        textToInsert = `\n### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'link':
        textToInsert = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        textToInsert = `![${selectedText || 'image alt text'}](image-url)`;
        break;
      case 'code':
        textToInsert = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        textToInsert = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
        break;
      case 'unorderedlist':
        textToInsert = `\n- ${selectedText || 'List item'}\n- Another item\n- And another\n`;
        break;
      case 'orderedlist':
        textToInsert = `\n1. ${selectedText || 'First item'}\n2. Second item\n3. Third item\n`;
        break;
      case 'quote':
        textToInsert = `\n> ${selectedText || 'Blockquote text'}\n`;
        break;
      default:
        textToInsert = selectedText;
    }
    
    const newText = textarea.value.substring(0, start) + textToInsert + textarea.value.substring(end);
    setData('content', newText);
    debouncedSaveContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  // Insert image from media gallery
  const insertImageFromGallery = (imageUrl: string, altText: string) => {
    const markdownImage = `![${altText}](${imageUrl})`;
    insertAtCursor(markdownImage);
  };

  // Parse markdown to HTML for preview
  const renderMarkdown = () => {
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(data.content));
    return { __html: sanitizedHtml };
  };

  return (
    <AppLayout title={data.title || 'New Article'} breadcrumbs={breadcrumbItems}>
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
            <Button 
              variant="default" 
              size="sm" 
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </div>

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

        {/* Main editor with tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <div className="mt-2 border rounded-md">
            {/* Markdown toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-muted rounded-t-md border-b">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('bold')}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('italic')}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6 mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('h1')}
                    >
                      <Heading1 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 1</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('h2')}
                    >
                      <Heading2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 2</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('h3')}
                    >
                      <Heading3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 3</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6 mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('link')}
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Link</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('image')}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Image</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6 mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('code')}
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Inline Code</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('codeblock')}
                    >
                      <Terminal className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Code Block</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6 mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('unorderedlist')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('orderedlist')}
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Numbered List</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertMarkdown('quote')}
                    >
                      <Quote className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Blockquote</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Tab content */}
            <TabsContent value="write" className="p-0 m-0">
              <Textarea
                ref={textareaRef}
                value={data.content}
                onChange={handleContentChange}
                placeholder="Start writing your article using Markdown..."
                className="min-h-[500px] resize-y rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-sm"
              />
            </TabsContent>
            
            <TabsContent value="preview" className="p-0 m-0">
              <div className="min-h-[500px] p-4 prose dark:prose-invert max-w-none">
                {data.content ? (
                  <div dangerouslySetInnerHTML={renderMarkdown()} />
                ) : (
                  <p className="text-muted-foreground italic">No content to preview yet.</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Word count and reading time */}
        <div className="mb-6 flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{wordCount} words · {readingTime} min read</span>
        </div>

        {/* Media gallery */}
        <div className="border rounded-md">
          <div className="p-4 bg-muted border-b flex items-center justify-between">
            <h3 className="font-medium">Media Gallery</h3>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <div>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </div>
                </Button>
                <input 
                  id="file-upload" 
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="p-4">
            {uploading && (
              <div className="mb-4 text-sm text-muted-foreground flex items-center">
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading image...
              </div>
            )}
            
            {media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group border rounded-md overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.filename} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => insertImageFromGallery(item.url, item.filename)}
                      >
                        Insert
                      </Button>
                    </div>
                    <div className="p-2 text-xs truncate border-t bg-muted">
                      {item.filename}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                <FileImage className="w-12 h-12 mb-2 opacity-20" />
                <p>No media uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}