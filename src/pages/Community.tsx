import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Share2,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    business_name: string;
    display_name?: string;
  };
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ads");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    } else {
      fetchPosts();
    }
  }, [navigate, activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .eq("category", activeTab)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } else {
      // Fetch profiles separately for each post
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("business_name, display_name")
            .eq("id", post.user_id)
            .single();
          
          return { ...post, profiles: profile };
        })
      );
      setPosts(postsWithProfiles as Post[]);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to post",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        title: newPostTitle,
        content: newPostContent,
        category: activeTab,
        status: "approved" // Will add AI moderation later
      });

    if (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success! 🎉",
        description: "Your post is now live",
      });
      setNewPostTitle("");
      setNewPostContent("");
      fetchPosts();
    }
    setIsSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("community_likes")
      .insert({ post_id: postId, user_id: user.id });

    if (error && error.code !== "23505") { // Ignore duplicate error
      console.error("Error liking post:", error);
    } else {
      fetchPosts();
      toast({
        title: "Liked! ❤️",
        description: "Thanks for supporting the community"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "ads": return <TrendingUp className="w-4 h-4" />;
      case "tips": return <Sparkles className="w-4 h-4" />;
      case "events": return <Calendar className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Community Hub</h1>
              <p className="text-xs text-muted-foreground">Connect & Grow Together</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Create Post Section */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Share with Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="text-lg font-semibold"
            />
            <Textarea
              placeholder="What's on your mind? Share a tip, promote your business, or ask a question..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Posting to: <span className="font-semibold capitalize">{activeTab}</span>
              </p>
              <Button 
                onClick={handleCreatePost} 
                disabled={isSubmitting}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ads" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Ads & Offers
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Tips & Q&A
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share something awesome!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="gap-1">
                          {getCategoryIcon(post.category)}
                          <span className="capitalize">{post.category}</span>
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        by {post.profiles?.display_name || post.profiles?.business_name || "Anonymous"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{post.content}</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="gap-2 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments_count}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 hover:text-green-500 transition-colors"
                      onClick={() => {
                        navigator.share?.({
                          title: post.title,
                          text: post.content,
                          url: window.location.href
                        }).catch(() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link Copied! 📋",
                            description: "Share link copied to clipboard"
                          });
                        });
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Community;