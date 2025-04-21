<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ArticleController extends Controller
{
    /**
     * Display a listing of the articles.
     */
    public function index()
    {
        try {
            $articles = Auth::user()->articles()
                ->orderBy('updated_at', 'desc')
                ->get();
                
            return Inertia::render('articles/index', [
                'articles' => $articles,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching articles: ' . $e->getMessage());
            return back()->with('error', 'Could not load articles.');
        }
    }

    /**
     * Show the form for creating a new article.
     */
    public function create()
    {
        try {
            // Create a temporary slug for the draft article
            $tempSlug = 'draft-' . Str::random(10);
            
            // Create a new draft article
            $article = Auth::user()->articles()->create([
                'title' => '',
                'content' => '',
                'status' => 'draft',
                'uuid' => Str::uuid(),
                'slug' => $tempSlug, // Add temporary slug
            ]);
            
            Log::info('Created new article', ['article_id' => $article->id, 'uuid' => $article->uuid]);
            
            return Inertia::render('articles/editor', [
                'article' => $article,
                'isNewArticle' => true,
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Failed to create article: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => Auth::id()
            ]);
            
            // Return error response
            return back()->with('error', 'Failed to create article. Please try again.');
        }
    }

    /**
     * Store a newly created article in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Article store attempt', ['data' => $request->all()]);
            
            $validated = $request->validate([
                'uuid' => 'required|string|exists:articles,uuid',
                'title' => 'nullable|string|max:255',
                'content' => 'nullable|string',
            ]);
            
            $article = Article::where('uuid', $validated['uuid'])
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$article) {
                Log::warning('Article not found during save', ['uuid' => $validated['uuid'], 'user_id' => Auth::id()]);
                return response()->json(['error' => 'Article not found'], 404);
            }
            
            // Update the article with new data
            $article->update([
                'title' => $validated['title'] ?? $article->title,
                'content' => $validated['content'] ?? $article->content,
            ]);
            
            // If title is updated, update the slug too (for draft articles)
            if (isset($validated['title']) && $article->status === 'draft') {
                $this->updateArticleSlug($article, $validated['title']);
            }
            
            $article->updateWordStats();
            
            // Create a version snapshot
            $article->createVersionSnapshot();
            
            Log::info('Article saved successfully', ['article_id' => $article->id, 'uuid' => $article->uuid]);
            
            return back()->with('success', 'Article saved successfully');
        } catch (\Exception $e) {
            Log::error('Error saving article: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Failed to save article: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the article title.
     */
    public function updateTitle(Request $request)
    {
        try {
            Log::info('Title update attempt', ['data' => $request->all()]);
            
            $validated = $request->validate([
                'uuid' => 'required|string|exists:articles,uuid',
                'title' => 'required|string|max:255',
            ]);
            
            $article = Article::where('uuid', $validated['uuid'])
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$article) {
                Log::warning('Article not found during title update', ['uuid' => $validated['uuid'], 'user_id' => Auth::id()]);
                return response()->json(['error' => 'Article not found'], 404);
            }
            
            // Update the article title
            $article->update([
                'title' => $validated['title'],
            ]);
            
            // Update the slug if the article is a draft
            if ($article->status === 'draft') {
                $this->updateArticleSlug($article, $validated['title']);
            }
            
            Log::info('Article title updated successfully', ['article_id' => $article->id, 'uuid' => $article->uuid]);
            
            return response()->json([
                'success' => true,
                'slug' => $article->slug,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating article title: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Failed to update title: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to update an article's slug based on title
     */
    private function updateArticleSlug(Article $article, string $title)
    {
        if (empty($title)) {
            // Keep existing slug if title is empty
            return;
        }
        
        // Generate base slug from title
        $baseSlug = Str::slug($title);
        
        // If the slug is empty (e.g., title has only special characters),
        // use a fallback
        if (empty($baseSlug)) {
            $baseSlug = 'article';
        }
        
        $slug = $baseSlug;
        $counter = 1;
        
        // Check for slug uniqueness
        while (Article::where('slug', $slug)
                ->where('id', '!=', $article->id)
                ->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        // Update the article with the new slug
        $article->update(['slug' => $slug]);
        
        return $slug;
    }

    /**
     * Update the article content.
     */
    public function updateContent(Request $request)
    {
        try {
            Log::info('Content update attempt', ['uuid' => $request->uuid]);
            
            $validated = $request->validate([
                'uuid' => 'required|string|exists:articles,uuid',
                'content' => 'nullable|string',
            ]);
            
            $article = Article::where('uuid', $validated['uuid'])
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$article) {
                Log::warning('Article not found during content update', ['uuid' => $validated['uuid'], 'user_id' => Auth::id()]);
                return response()->json(['error' => 'Article not found'], 404);
            }
                
            $article->update([
                'content' => $validated['content'],
            ]);
            
            $article->updateWordStats();
            
            Log::info('Article content updated successfully', ['article_id' => $article->id, 'uuid' => $article->uuid]);
            
            return response()->json([
                'success' => true,
                'word_count' => $article->word_count,
                'reading_time' => $article->reading_time,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating article content: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => ['uuid' => $request->uuid]
            ]);
            
            return response()->json(['error' => 'Failed to update content: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified article for editing.
     */
    public function edit(string $uuid)
    {
        try {
            $article = Article::where('uuid', $uuid)
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            return Inertia::render('articles/editor', [
                'article' => $article,
                'isNewArticle' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading article for edit: ' . $e->getMessage(), [
                'exception' => $e,
                'uuid' => $uuid,
                'user_id' => Auth::id()
            ]);
            
            return redirect()->route('articles.index')->with('error', 'Article not found or access denied.');
        }
    }

    /**
     * Generate a preview link for the article.
     */
    public function preview(Request $request)
    {
        try {
            $validated = $request->validate([
                'uuid' => 'required|string|exists:articles,uuid',
            ]);
            
            $article = Article::where('uuid', $validated['uuid'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            // Generate a temporary token for preview access
            $previewToken = Str::random(32);
            
            // Store the token in cache with an expiration
            cache()->put('preview_' . $previewToken, $article->uuid, now()->addHours(24));
            
            $previewUrl = route('articles.preview.show', ['token' => $previewToken]);
            
            return response()->json([
                'preview_url' => $previewUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating preview: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Failed to generate preview link'], 500);
        }
    }

    /**
     * Show the preview of an article.
     */
    public function showPreview(string $token)
    {
        try {
            $articleUuid = cache()->get('preview_' . $token);
            
            if (!$articleUuid) {
                abort(404);
            }
            
            $article = Article::where('uuid', $articleUuid)->firstOrFail();
            
            return Inertia::render('articles/preview', [
                'article' => $article,
                'author' => $article->author,
                'isPreview' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing preview: ' . $e->getMessage(), [
                'exception' => $e,
                'token' => $token
            ]);
            
            return redirect()->route('dashboard')->with('error', 'Preview not available or has expired.');
        }
    }

    /**
     * Publish the article.
     */
    public function publish(Request $request)
    {
        try {
            $validated = $request->validate([
                'uuid' => 'required|string|exists:articles,uuid',
            ]);
            
            $article = Article::where('uuid', $validated['uuid'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            if (empty($article->title) || empty($article->content)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article must have a title and content to be published.',
                ], 422);
            }
            
            // Ensure the slug is based on the title before publishing
            $this->updateArticleSlug($article, $article->title);
            
            $article->update([
                'status' => 'published',
                'published_at' => now(),
            ]);
            
            // Create a version snapshot on publish
            $article->createVersionSnapshot('Published Version');
            
            return response()->json([
                'success' => true,
                'article_url' => route('articles.show', $article->slug),
            ]);
        } catch (\Exception $e) {
            Log::error('Error publishing article: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Failed to publish article'], 500);
        }
    }

    /**
     * Display the published article.
     */
    public function show(string $slug)
    {
        try {
            $article = Article::where('slug', $slug)
                ->published()
                ->firstOrFail();
                
            return Inertia::render('articles/show', [
                'article' => $article,
                'author' => $article->author,
                'isPreview' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing article: ' . $e->getMessage(), [
                'exception' => $e,
                'slug' => $slug
            ]);
            
            return redirect()->route('dashboard')->with('error', 'Article not found.');
        }
    }

    /**
     * Upload media for the article.
     */
    public function uploadMedia(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240|mimes:jpeg,png,jpg,gif,svg',
                'article_uuid' => 'required|string|exists:articles,uuid',
            ]);
            
            $article = Article::where('uuid', $request->article_uuid)
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('media', $filename, 'public');
            
            // Create media record
            $media = Media::create([
                'user_id' => Auth::id(),
                'original_name' => $file->getClientOriginalName(),
                'filename' => $filename,
                'mime_type' => $file->getMimeType(),
                'path' => $path,
                'size' => $file->getSize(),
                'metadata' => [
                    'width' => getimagesize($file->path())[0] ?? null,
                    'height' => getimagesize($file->path())[1] ?? null,
                ],
            ]);
            
            // Attach media to article
            $article->media()->attach($media->id);
            
            return response()->json([
                'success' => true,
                'media' => [
                    'id' => $media->id,
                    'url' => $media->url,
                    'filename' => $media->original_name,
                    'mime_type' => $media->mime_type,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading media: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Failed to upload media: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get media for an article.
     */
    public function getArticleMedia(string $uuid)
    {
        try {
            $article = Article::where('uuid', $uuid)
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            $media = $article->media()->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'url' => $item->url,
                    'filename' => $item->original_name,
                    'mime_type' => $item->mime_type,
                ];
            });
            
            return response()->json([
                'success' => true,
                'media' => $media,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching article media: ' . $e->getMessage(), [
                'exception' => $e,
                'uuid' => $uuid
            ]);
            
            return response()->json(['error' => 'Failed to fetch media'], 500);
        }
    }

    /**
     * Remove the specified article from storage.
     */
    public function destroy(string $uuid)
    {
        try {
            $article = Article::where('uuid', $uuid)
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            // Delete article versions
            $article->versions()->delete();
            
            // Detach media (but don't delete them)
            $article->media()->detach();
            
            // Delete the article
            $article->delete();
            
            return redirect()->route('articles.index')->with('success', 'Article deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting article: ' . $e->getMessage(), [
                'exception' => $e,
                'uuid' => $uuid,
                'user_id' => Auth::id()
            ]);
            
            return redirect()->route('articles.index')->with('error', 'Failed to delete article.');
        }
    }
}