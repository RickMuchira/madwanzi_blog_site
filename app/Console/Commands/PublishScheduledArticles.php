<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PublishScheduledArticles extends Command
{
    protected $signature = 'articles:publish-scheduled';
    protected $description = 'Publish articles that are scheduled for publication';

    public function handle()
    {
        $articles = Article::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($articles as $article) {
            try {
                $article->update([
                    'status' => 'published',
                    'published_at' => now(),
                ]);
                
                // Create published version
                $article->createVersionSnapshot('Published Version');
                
                $count++;
                $this->info("Published scheduled article: {$article->title}");
                Log::info("Published scheduled article", ['article_id' => $article->id]);
            } catch (\Exception $e) {
                $this->error("Failed to publish article ID {$article->id}: {$e->getMessage()}");
                Log::error("Failed to publish scheduled article", [
                    'article_id' => $article->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("Published {$count} scheduled articles");
        return Command::SUCCESS;
    }
}