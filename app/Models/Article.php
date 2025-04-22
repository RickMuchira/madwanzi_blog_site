<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Article extends Model
{
   use HasFactory;

   /**
    * The attributes that are mass assignable.
    *
    * @var array<int, string>
    */
   protected $fillable = [
       'uuid',
       'user_id',
       'title',
       'slug',
       'content',
       'status',
       'published_at',
       'scheduled_at',
       'seo_data',
       'word_count',
       'reading_time',
   ];

   /**
    * The attributes that should be cast.
    *
    * @var array<string, string>
    */
   protected $casts = [
       'published_at' => 'datetime',
       'scheduled_at' => 'datetime',
       'seo_data' => 'array', // Changed from 'json' for better compatibility
   ];

   /**
    * Boot the model.
    */
   protected static function boot()
   {
       parent::boot();

       static::creating(function ($article) {
           $article->uuid = $article->uuid ?? (string) Str::uuid();
           
           if (empty($article->slug) && !empty($article->title)) {
               $article->slug = Str::slug($article->title);
           }
       });
       
       static::updating(function ($article) {
           // Only update the slug if title changed and the slug hasn't been manually set
           if ($article->isDirty('title') && !$article->isDirty('slug') && !empty($article->title)) {
               $article->slug = Str::slug($article->title);
           }
       });
   }

   /**
    * Get the user that owns the article.
    */
   public function author(): BelongsTo
   {
       return $this->belongsTo(User::class, 'user_id');
   }

   /**
    * Get the article versions.
    */
   public function versions(): HasMany
   {
       return $this->hasMany(ArticleVersion::class);
   }

   /**
    * Get the media attached to the article.
    */
   public function media(): BelongsToMany
   {
       return $this->belongsToMany(Media::class, 'article_media')
           ->withTimestamps();
   }

   /**
    * Create a version snapshot of the current content.
    */
   public function createVersionSnapshot(string $versionName = null): ?ArticleVersion
   {
       try {
           return $this->versions()->create([
               'content' => $this->content ?? '',
               'version_name' => $versionName ?? 'Snapshot ' . ($this->versions()->count() + 1),
           ]);
       } catch (\Exception $e) {
           \Log::error('Error creating version snapshot: ' . $e->getMessage(), [
               'article_id' => $this->id,
               'exception' => $e
           ]);
           return null;
       }
   }

   /**
    * Calculate and update the word count and reading time.
    */
   public function updateWordStats(): self
   {
       try {
           // If content is null, set default values
           if (empty($this->content)) {
               $this->word_count = 0;
               $this->reading_time = 0;
               $this->save();
               return $this;
           }
           
           // Safely strip tags and count words
           $plainText = strip_tags($this->content ?? '');
           $this->word_count = str_word_count($plainText);
           
           // Calculate reading time (average reading speed is about 200 words per minute)
           // Minimum 1 minute reading time
           $this->reading_time = max(1, ceil($this->word_count / 200));
           
           $this->save();
           
           return $this;
       } catch (\Exception $e) {
           \Log::error('Error updating word stats: ' . $e->getMessage(), [
               'article_id' => $this->id,
               'exception' => $e
           ]);
           
           // Don't let this failure prevent saving
           return $this;
       }
   }

   /**
    * Scope a query to only include published articles.
    */
   public function scopePublished($query)
   {
       return $query->where('status', 'published')
           ->whereNotNull('published_at')
           ->where('published_at', '<=', now());
   }

   /**
    * Scope a query to only include draft articles.
    */
   public function scopeDraft($query)
   {
       return $query->where('status', 'draft');
   }
   
   /**
    * Scope a query to only include scheduled articles.
    */
   public function scopeScheduled($query)
   {
       return $query->where('status', 'scheduled')
           ->whereNotNull('scheduled_at');
   }
}