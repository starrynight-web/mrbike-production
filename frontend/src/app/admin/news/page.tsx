"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Newspaper,
    Calendar,
    User as UserIcon,
    ArrowUpRight,
    Save,
    Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock Data for News Articles
const mockArticles = [
    {
        id: "1",
        title: "Yamaha R15 V4 vs KTM RC 200: The Ultimate Sportbike Comparison",
        author: "Ahmed Raza",
        category: "comparison",
        status: "published",
        publishedAt: "2026-01-28",
        views: 4500,
        image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Top 5 Upcoming Motorcycles in Bangladesh for 2026",
        author: "Nabil Khan",
        category: "launch",
        status: "published",
        publishedAt: "2026-01-25",
        views: 12800,
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Honda CB150R Long Term Review: Is it worth the premium?",
        author: "Fahim Ahmed",
        category: "review",
        status: "draft",
        publishedAt: "-",
        views: 0,
        image: "https://images.unsplash.com/photo-1568772585407-9363f9bf3a87?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Government Policy Change: New VAT on Imported Motorcycles",
        author: "Editorial Team",
        category: "industry",
        status: "published",
        publishedAt: "2026-01-20",
        views: 8400,
        image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=200&auto=format&fit=crop"
    }
];

const categories = [
    { value: "launch", label: "Launch News" },
    { value: "review", label: "Reviews" },
    { value: "comparison", label: "Comparisons" },
    { value: "industry", label: "Industry Updates" },
    { value: "tips", label: "Riding Tips" },
];

export default function AdminNewsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [articles, setArticles] = useState(mockArticles);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newArticle, setNewArticle] = useState({
        title: "",
        category: "launch",
        excerpt: "",
        content: "",
        author: "Admin User",
        tags: ""
    });

    const handleCreateArticle = (e: React.FormEvent) => {
        e.preventDefault();
        const articleToAdd = {
            id: Date.now().toString(),
            title: newArticle.title,
            author: newArticle.author,
            category: newArticle.category,
            status: "draft" as const,
            publishedAt: "-",
            views: 0,
            image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=200&auto=format&fit=crop"
        };
        setArticles([articleToAdd, ...articles]);
        setIsCreateDialogOpen(false);
        toast.success("Article created as draft");
        setNewArticle({
            title: "",
            category: "launch",
            excerpt: "",
            content: "",
            author: "Admin User",
            tags: ""
        });
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this article?")) {
            setArticles(articles.filter(a => a.id !== id));
            toast.success("Article deleted successfully");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">News & Articles</h1>
                    <p className="text-muted-foreground">
                        Manage your platform's editorial content, news, and bike reviews.
                    </p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Create New Article
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleCreateArticle}>
                            <DialogHeader>
                                <DialogTitle>Create New Article</DialogTitle>
                                <DialogDescription>
                                    Write a new blog post, news update, or bike review. Articles are saved as drafts by default.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Article Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Yamaha R15 V4 Launch Event in Dhaka"
                                        required
                                        value={newArticle.title}
                                        onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={newArticle.category}
                                            onValueChange={v => setNewArticle({ ...newArticle, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="author">Author Name</Label>
                                        <Input
                                            id="author"
                                            value={newArticle.author}
                                            onChange={e => setNewArticle({ ...newArticle, author: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
                                    <Textarea
                                        id="excerpt"
                                        placeholder="Briefly describe what this article is about for the list view..."
                                        rows={2}
                                        value={newArticle.excerpt}
                                        onChange={e => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Article Content (Markdown supported)</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Write your article content here..."
                                        rows={12}
                                        required
                                        value={newArticle.content}
                                        onChange={e => setNewArticle({ ...newArticle, content: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (Comma separated)</Label>
                                    <Input
                                        id="tags"
                                        placeholder="e.g. yamaha, sportbike, launch"
                                        value={newArticle.tags}
                                        onChange={e => setNewArticle({ ...newArticle, tags: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                    <div className="h-20 w-32 border-2 border-dashed rounded flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                                        <ImageIcon className="h-6 w-6 mb-1" />
                                        <span className="text-[10px]">Featured Image</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Upload a high-quality featured image (16:9 ratio recommended).<br />
                                        Max size: 2MB.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" /> Save as Draft
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or author..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Article Details</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredArticles.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell>
                                            <div className="h-12 w-16 rounded overflow-hidden bg-muted">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="font-medium line-clamp-1">{article.title}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Eye className="h-3 w-3" /> {article.views.toLocaleString()} views
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {article.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                                                    <UserIcon className="h-3 w-3" />
                                                </div>
                                                <span className="text-sm">{article.author}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={article.status === "published" ? "default" : "secondary"}>
                                                {article.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {article.publishedAt}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <ArrowUpRight className="mr-2 h-4 w-4" /> Settings & SEO
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(article.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Article
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredArticles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Newspaper className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No articles found matching your filters.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
