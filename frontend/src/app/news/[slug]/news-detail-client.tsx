"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Clock,
    Calendar,
    Share2,
    ChevronRight,
    Facebook,
    Twitter,
    Linkedin,
    Hash,
    ArrowLeft
} from "lucide-react";
import { useNewsArticle } from "@/hooks/use-news";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewsDetailClientProps {
    slug: string;
}

export function NewsDetailClient({ slug }: NewsDetailClientProps) {
    const { data: article, isLoading } = useNewsArticle(slug);

    if (isLoading) {
        return <LoadingState />;
    }

    if (!article) {
        return <NotFoundState />;
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                url: window.location.href,
            });
        }
    };

    const safeHtml = DOMPurify.sanitize(article.content || "");

    return (
        <article className="min-h-screen pb-20">
            {/* Breadcrumb / Back Navigation */}
            <div className="bg-muted/30 border-b sticky top-0 z-10 backdrop-blur-md bg-background/80">
                <div className="container py-3 max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
                        <Link href="/news" className="hover:text-foreground flex items-center transition-colors">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to News
                        </Link>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">
                            {article.title}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto py-8 md:py-12 space-y-8">

                {/* Article Header */}
                <header className="space-y-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Badge className="capitalize px-3 py-1 text-base">{article.category}</Badge>
                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium ml-auto sm:ml-0">
                            <Clock className="h-4 w-4" />
                            5 min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                        {article.title}
                    </h1>

                    <div className="flex items-center justify-between py-4 border-y">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const author = article.author || {};
                                const authorName = author?.name || '';
                                const initials = authorName ? authorName.charAt(0) : '?';
                                return (
                                    <>
                                        <Avatar className="h-10 w-10 border">
                                            {author?.image ? (
                                                <AvatarImage src={author.image} alt={authorName || 'Author'} />
                                            ) : null}
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold">{authorName || 'Unknown Author'}</p>
                                            <p className="text-xs text-muted-foreground">Author</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex items-center gap-2">
                            <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-sky-100 hover:text-sky-500 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="aspect-[16/9] relative rounded-2xl overflow-hidden shadow-sm">
                    <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <div
                    className="prose prose-zinc dark:prose-invert max-w-none 
                    first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left
                    [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-muted-foreground/90 [&>p]:mb-6
                    [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-foreground
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>li]:mb-2"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />

                <Separator className="my-8" />

                {/* Footer / Tags */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {(article.tags ?? []).map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="bg-muted/30 rounded-xl p-8 text-center space-y-4">
                        <h3 className="text-xl font-bold">Enjoyed this article?</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Subscribe to our newsletter to get the latest bike news and reviews delivered straight to your inbox.
                        </p>
                        <div className="flex gap-2 max-w-xs mx-auto">
                            <Button className="w-full">Subscribe Newsletter</Button>
                        </div>
                    </div>
                </div>

            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <div className="container max-w-4xl mx-auto py-12 space-y-8">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-16 w-3/4 bg-muted rounded" />
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-10 w-32 bg-muted rounded" />
            </div>
            <div className="aspect-video w-full bg-muted rounded-2xl" />
            <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
        </div>
    );
}

function NotFoundState() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8 text-lg">
                The article you are looking for does not exist or has been removed.
            </p>
            <Button asChild size="lg">
                <Link href="/news">Browse All News</Link>
            </Button>
        </div>
    );
}
