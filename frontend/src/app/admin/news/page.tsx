"use client";

import { useState } from "react";
import Image from "next/image";
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
  Image as ImageIcon,
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
  DialogTrigger,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNews } from "@/hooks/use-news";
import { adminAPI } from "@/lib/admin-api";
import { getSafeImageUrl } from "@/lib/utils";

interface Tag {
  id: number;
  name: string;
}

interface Article {
  id: string | number;
  title: string;
  slug?: string;
  category: string;
  excerpt?: string;
  content: string;
  author?: {
    id: string | number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  tags?: string[] | Tag[];
  featured_image?: string;
  created_at?: string | Date;
  published_at?: string | Date;
  views?: number;
  is_published?: boolean;
}

const CATEGORIES = [
  { label: "Launch", value: "launch" },
  { label: "Review", value: "review" },
  { label: "Feature", value: "feature" },
  { label: "Tips", value: "tips" },
  { label: "News", value: "news" },
];

export default function AdminNewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: articlesData, refetch } = useNews(
    categoryFilter !== "all" ? { category: categoryFilter } : undefined,
  );

  // Handle data structure from useNews hook ({ articles, meta })
  const articles = articlesData?.articles || [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(
    null,
  );
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "news",
    excerpt: "",
    content: "",
    author: "Admin User",
    tags: "",
    is_published: false,
    meta_title: "",
    meta_description: "",
  });

  const resetForm = () => {
    setNewArticle({
      title: "",
      category: "news",
      excerpt: "",
      content: "",
      author: "Admin User",
      tags: "",
      is_published: false,
      meta_title: "",
      meta_description: "",
    });
    setImageFile(null);
    setCurrentImagePreview(null);
    setEditingId(null);
  };

  const handleEdit = (article: Article & { meta_title?: string; meta_description?: string }) => {
    setNewArticle({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt || "",
      content: article.content,
      author: article.author?.username || "Admin User",
      tags: article.tags
        ? (article.tags as (string | Tag)[])
          .map((t) => (typeof t === "string" ? t : t.name))
          .join(", ")
        : "",
      is_published: article.is_published || false,
      meta_title: article.meta_title || "",
      meta_description: article.meta_description || "",
    });
    setCurrentImagePreview(article.featured_image || null);
    setEditingId(article.id.toString());
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading(editingId ? "Updating article..." : "Creating article...");
    try {
      const formData = new FormData();
      formData.append("title", newArticle.title);
      formData.append("category", newArticle.category);
      formData.append("excerpt", newArticle.excerpt);
      formData.append("content", newArticle.content);
      formData.append("tags", newArticle.tags);
      formData.append("is_published", String(newArticle.is_published));
      formData.append("meta_title", newArticle.meta_title);
      formData.append("meta_description", newArticle.meta_description);

      if (imageFile) {
        formData.append("featured_image", imageFile);
      }

      if (editingId) {
        await adminAPI.updateArticle(editingId, formData);
        toast.success("Article updated successfully", { id: toastId });
      } else {
        await adminAPI.createArticle(formData);
        toast.success("Article created successfully", { id: toastId });
      }

      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Failed to save article:", error);
      toast.error(error.message || "Failed to save article", { id: toastId });
    }
  };

  const handlePreview = (article: Article) => {
    if (!article.slug) {
      toast.error("Article slug not found. Save as draft first.");
      return;
    }
    window.open(`/news/${article.slug}`, "_blank");
  };

  const filteredArticles = articles.filter((article: Article) => {
    const matchesSearch =
      (article.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.author?.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    // Category filter is already handled by the API hook, but we can double check or handle 'all'
    // const matchesCategory =
    //   categoryFilter === "all" ||
    //   article.category === categoryFilter ||
    //   (article.categories && article.categories.includes(categoryFilter));
    return matchesSearch; // Category check is largely redundant if API handles it, but harmless
  });

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await adminAPI.deleteArticle(id);
        toast.success("Article deleted successfully");
        refetch();
      } catch (error) {
        console.error("Failed to delete article:", error);
        toast.error("Failed to delete article");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & Articles</h1>
          <p className="text-muted-foreground">
            Manage your platform&apos;s editorial content, news, and bike
            reviews.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="shrink-0"
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Article" : "Create New Article"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the article details below."
                    : "Write a new blog post, news update, or bike review. Articles are saved as drafts by default."}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Article Content</TabsTrigger>
                    <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Article Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Yamaha R15 V4 Launch Event in Dhaka"
                        required
                        value={newArticle.title}
                        onChange={(e) =>
                          setNewArticle({ ...newArticle, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newArticle.category}
                          onValueChange={(v) =>
                            setNewArticle({ ...newArticle, category: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat: { label: string; value: string }) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Author Name</Label>
                        <Input
                          id="author"
                          value={newArticle.author}
                          onChange={(e) =>
                            setNewArticle({ ...newArticle, author: e.target.value })
                          }
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
                        onChange={(e) =>
                          setNewArticle({ ...newArticle, excerpt: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">
                        Article Content (Markdown supported)
                      </Label>
                      <Textarea
                        id="content"
                        placeholder="Write your article content here..."
                        rows={12}
                        required
                        value={newArticle.content}
                        onChange={(e) =>
                          setNewArticle({ ...newArticle, content: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (Comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g. yamaha, sportbike, launch"
                        value={newArticle.tags}
                        onChange={(e) =>
                          setNewArticle({ ...newArticle, tags: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                      <label className="h-20 w-32 border-2 border-dashed rounded flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden">
                        {(imageFile || currentImagePreview) ? (
                          <Image
                            src={imageFile ? URL.createObjectURL(imageFile) : getSafeImageUrl(currentImagePreview)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-xs">
                            <ImageIcon className="h-5 w-5 mb-1" />
                            <span>Add Image</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setImageFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Upload a high-quality featured image (16:9 ratio
                        recommended).
                        <br />
                        Max size: 2MB.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_published" className="text-base">
                          Publish Article
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Make this article visible on the public website immediately.
                        </p>
                      </div>
                      <Switch
                        id="is_published"
                        checked={newArticle.is_published}
                        onCheckedChange={(checked) =>
                          setNewArticle({ ...newArticle, is_published: checked })
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-6 py-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                        <Input
                          id="meta_title"
                          placeholder="Search engine optimized title..."
                          value={newArticle.meta_title}
                          onChange={(e) =>
                            setNewArticle({ ...newArticle, meta_title: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended length: 50-60 characters.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                          id="meta_description"
                          placeholder="Brief description for search results..."
                          rows={4}
                          value={newArticle.meta_description}
                          onChange={(e) =>
                            setNewArticle({ ...newArticle, meta_description: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended length: 150-160 characters.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Search className="h-4 w-4" /> Search Engine Preview
                        </h4>
                        <div className="space-y-1">
                          <p className="text-blue-600 hover:underline cursor-pointer text-lg font-medium leading-tight">
                            {newArticle.meta_title || newArticle.title || "Article Title Prevew"}
                          </p>
                          <p className="text-green-700 text-sm line-clamp-1">
                            mrbikebd.com › news › {newArticle.title.toLowerCase().replace(/\s+/g, '-')}
                          </p>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {newArticle.meta_description || newArticle.excerpt || "Article description preview will appear here when you write a meta description or an excerpt."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> {editingId ? "Update Article" : "Create Article"}
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
                  {CATEGORIES.map((cat: { label: string; value: string }) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
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
          <div className="rounded-md border overflow-x-auto">
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
                      <div className="h-12 w-16 rounded overflow-hidden bg-muted relative">
                        <Image
                          src={getSafeImageUrl(article.featured_image)}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium line-clamp-1">
                        {article.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Eye className="h-3 w-3" />{" "}
                        {(article.views ?? 0).toLocaleString()} views
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
                        <span className="text-sm">{article.author?.username || 'Admin'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          article.is_published
                            ? "default"
                            : "secondary"
                        }
                      >
                        {article.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {article.published_at ? new Date(article.published_at).toLocaleDateString() : '-'}
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
                          <DropdownMenuItem onClick={() => handleEdit(article)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreview(article)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowUpRight className="mr-2 h-4 w-4" /> Settings &
                            SEO
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
