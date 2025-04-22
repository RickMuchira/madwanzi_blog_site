<?php

use App\Http\Controllers\ArticleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
   // Article management routes
   Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
   Route::get('/articles/create', [ArticleController::class, 'create'])->name('articles.create');
   Route::post('/articles', [ArticleController::class, 'store'])->name('articles.store');
   Route::get('/articles/{uuid}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
   Route::delete('/articles/{uuid}', [ArticleController::class, 'destroy'])->name('articles.destroy');
   
   // Article title and content update routes (for autosave)
   Route::patch('/articles/{uuid}/title', [ArticleController::class, 'updateTitle'])->name('articles.update.title');
   Route::patch('/articles/{uuid}/content', [ArticleController::class, 'updateContent'])->name('articles.update.content');
   
   // Article preview and publish routes
   Route::post('/articles/preview', [ArticleController::class, 'preview'])->name('articles.preview');
   Route::post('/articles/{uuid}/publish', [ArticleController::class, 'publish'])->name('articles.publish');
   
   // Add schedule route for articles
   Route::post('/articles/{uuid}/schedule', [ArticleController::class, 'schedule'])->name('articles.schedule');
   
   // Media upload route
   Route::post('/articles/media', [ArticleController::class, 'uploadMedia'])->name('articles.media.upload');
   
   // Add this missing API route for fetching article media
   Route::get('/api/articles/{uuid}/media', [ArticleController::class, 'getArticleMedia'])->name('api.articles.media');
});

// Public article routes
Route::get('/articles/{slug}', [ArticleController::class, 'show'])->name('articles.show');
Route::get('/preview/{token}', [ArticleController::class, 'showPreview'])->name('articles.preview.show');