<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;

class Media extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'original_name',
        'filename',
        'mime_type',
        'path',
        'size',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array', // Changed from 'json' for better compatibility
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'url',
    ];

    /**
     * Get the user that owns the media.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the articles that use this media.
     */
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_media')
            ->withTimestamps();
    }

    /**
     * Get the full URL to the media file.
     */
    public function getUrlAttribute(): string
    {
        $url = asset('storage/' . $this->path);
        
        // Debug URL construction
        Log::info('Constructing media URL', [
            'media_id' => $this->id,
            'path' => $this->path,
            'full_url' => $url
        ]);
        
        return $url;
    }
}