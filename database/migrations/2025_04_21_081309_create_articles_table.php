<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('slug')->unique()->nullable();
            $table->text('content')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable(); // Added scheduled_at column
            $table->json('seo_data')->nullable();
            $table->integer('word_count')->default(0);
            $table->integer('reading_time')->default(0);
            $table->timestamps();
        });
        
        Schema::create('article_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('version_name')->nullable();
            $table->timestamps();
        });
        
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_name');
            $table->string('filename');
            $table->string('mime_type');
            $table->string('path');
            $table->integer('size');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
        
        Schema::create('article_media', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->primary(['article_id', 'media_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_media');
        Schema::dropIfExists('media');
        Schema::dropIfExists('article_versions');
        Schema::dropIfExists('articles');
    }
};