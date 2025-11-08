import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  Clock, 
  BookOpen, 
  CheckCircle2,
  Search,
  TrendingUp,
  PlayCircle,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  thumbnail_url: string | null;
  content: string;
}

interface CourseProgress {
  course_id: string;
  completed: boolean;
  progress_percentage: number;
}

const Academy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
      return;
    }
    loadCourses();
  }, [navigate]);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      const { data: progressData } = await supabase
        .from("course_progress")
        .select("*");

      setCourses(coursesData || []);
      
      const progressMap: Record<string, CourseProgress> = {};
      progressData?.forEach(p => {
        progressMap[p.course_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          course_id: courseId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          progress_percentage: 10,
          last_accessed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Course Started! 🎓",
        description: "Your progress has been saved"
      });

      loadCourses();
    } catch (error) {
      console.error("Error starting course:", error);
    }
  };

  const completeCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          course_id: courseId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          completed: true,
          progress_percentage: 100,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Congratulations! 🎉",
        description: "Course completed successfully!"
      });

      loadCourses();
    } catch (error) {
      console.error("Error completing course:", error);
    }
  };

  const categories = ["all", ...new Set(courses.map(c => c.category))];
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const completedCount = Object.values(progress).filter(p => p.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">SmartBizGrow Academy</h1>
              <p className="text-muted-foreground">Free learning platform for business growth</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(progress).length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const courseProgress = progress[course.id];
              const isCompleted = courseProgress?.completed;
              const progressPercent = courseProgress?.progress_percentage || 0;

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    {isCompleted && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {course.duration_minutes} minutes
                    </div>

                    {courseProgress && !isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!courseProgress ? (
                        <Button onClick={() => startCourse(course.id)} className="w-full gap-2">
                          <PlayCircle className="w-4 h-4" />
                          Start Course
                        </Button>
                      ) : isCompleted ? (
                        <Button variant="outline" className="w-full gap-2">
                          <Star className="w-4 h-4" />
                          Review
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" className="flex-1">Continue</Button>
                          <Button onClick={() => completeCourse(course.id)} className="flex-1">
                            Complete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No courses found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Academy;
