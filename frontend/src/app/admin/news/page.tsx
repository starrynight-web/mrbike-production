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
import { toast } from "sonner";
import { useNews } from "@/hooks/use-news";
import { adminAPI } from "@/lib/admin-api";

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt?: string;
  content: string;
  author?: string | { name: string };
  tags?: string;
  image?: string;
  created_at?: string;
  [key: string]: unknown;
}

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

  const { data: articlesData = [], refetch } = useNews(
    categoryFilter !== "all" ? categoryFilter : undefined,
  );

  // Handle different API response structures
  const articles = Array.isArray(articlesData)
    ? articlesData
    : (articlesData as unknown as { results: Article[] }).results || [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(
    null,
  );
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "launch",
    excerpt: "",
    content: "",
    author: "Admin User",
    tags: "",
  });

  const resetForm = () => {
    setNewArticle({
      title: "",
      category: "launch",
      excerpt: "",
      content: "",
      author: "Admin User",
      tags: "",
    });
    setImageFile(null);
    setCurrentImagePreview(null);
    setEditingId(null);
  };

  const handleEdit = (article: Article) => {
    setNewArticle({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt || "",
      content: article.content,
      author:
        typeof article.author === "object"
          ? article.author.name
          : article.author || "Admin User",
      tags: article.tags || "",
    });
    setCurrentImagePreview(article.image || null);
    setEditingId(article.id);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", newArticle.title);
      formData.append("category", newArticle.category);
      formData.append("excerpt", newArticle.excerpt);
      formData.append("content", newArticle.content);
      // formData.append("author", newArticle.author); // Backend usually handles this from token
      formData.append("tags", newArticle.tags);

      if (imageFile) {
        formData.append("featured_image", imageFile); // Adjust field name as per backend
      }

      if (editingId) {
        await adminAPI.updateArticle(editingId, formData);
        toast.success("Article updated successfully");
      } else {
        await adminAPI.createArticle(formData);
        toast.success("Article created successfully");
      }

      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error("Failed to save article");
    }
  };

  const filteredArticles = articles.filter((article: Article) => {
    const matchesSearch =
      (article.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof article.author === "string"
        ? article.author
        : article.author?.name || ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    // Category filter is already handled by the API hook, but we can double check or handle 'all'
    // const matchesCategory =
    //   categoryFilter === "all" ||
    //   article.category === categoryFilter ||
    //   (article.categories && article.categories.includes(categoryFilter));
    return matchesSearch; // Category check is largely redundant if API handles it, but harmless
  });

  const handleDelete = async (id: string) => {
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

              <div className="space-y-6 py-6">
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

                <div className="grid grid-cols-2 gap-4">
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
                        {categories.map((cat) => (
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
                    {imageFile ? (
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : currentImagePreview ? (
                      <Image
                        src={currentImagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 mb-1" />
                        <span className="text-[10px]">Featured Image</span>
                      </>
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
                  {categories.map((cat) => (
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
                      <div className="h-12 w-16 rounded overflow-hidden bg-muted relative">
                        <Image
                          src={article.image}
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
                        {article.views.toLocaleString()} views
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
                      <Badge
                        variant={
                          article.status === "published"
                            ? "default"
                            : "secondary"
                        }
                      >
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
                          <DropdownMenuItem onClick={() => handleEdit(article)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
