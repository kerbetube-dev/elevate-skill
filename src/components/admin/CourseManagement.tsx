import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  BookOpen, 
  Plus,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle,
  Upload,
  X,
  MoreVertical,
  Grid3X3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, Course, CoursesResponse, Coursecreated_ata, getImageUrl } from '@/services/admin';

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<Coursecreated_ata>({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    duration: '',
    level: 'Beginner',
    image: '',
    outcomes: [],
    curriculum: []
  });
  const [outcomesInput, setOutcomesInput] = useState('');
  const [curriculumInput, setCurriculumInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const limit = 20;

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCourses(
        currentPage, 
        limit, 
        searchTerm || undefined, 
        categoryFilter !== 'all' ? categoryFilter : undefined,
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to fetch courses';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await adminService.getCourseCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (course: Course) => {
    try {
      setDetailsLoading(true);
      setSelectedCourse(course);
      const details = await adminService.getCourseDetails(course.id);
      setCourseDetails(details);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      duration: course.duration,
      level: course.level,
      image: course.image,
      outcomes: course.outcomes || [],
      curriculum: course.curriculum || []
    });
    setImagePreview(getImageUrl(course.image));
    setShowEditDialog(true);
  };

  const handleCreateCourse = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleSubmitCreate = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('instructor', formData.instructor);
      submitData.append('price', formData.price.toString());
      submitData.append('duration', formData.duration);
      submitData.append('level', formData.level);
      
      if (formData.outcomes && formData.outcomes.length > 0) {
        submitData.append('outcomes', JSON.stringify(formData.outcomes));
      }
      
      if (formData.curriculum && formData.curriculum.length > 0) {
        submitData.append('curriculum', JSON.stringify(formData.curriculum));
      }
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      await adminService.createCourse(submitData);
      toast({
        title: "Course Created",
        description: "Course created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to create course';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingCourse) return;
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('instructor', formData.instructor);
      submitData.append('price', formData.price.toString());
      submitData.append('duration', formData.duration);
      submitData.append('level', formData.level);
      
      if (formData.outcomes && formData.outcomes.length > 0) {
        submitData.append('outcomes', JSON.stringify(formData.outcomes));
      }
      
      if (formData.curriculum && formData.curriculum.length > 0) {
        submitData.append('curriculum', JSON.stringify(formData.curriculum));
      }
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      await adminService.updateCourse(editingCourse.id, submitData);
      toast({
        title: "Course Updated",
        description: "Course updated successfully",
      });
      setShowEditDialog(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to update course';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      setProcessingId(courseId);
      await adminService.deleteCourse(courseId);
      toast({
        title: "Course Deleted",
        description: "Course deleted successfully",
      });
      fetchCourses();
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to delete course';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      setProcessingId(courseId);
      await adminService.updateCourseStatus(courseId, !currentStatus);
      
      toast({
        title: "Course Status Updated",
        description: `Course ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchCourses();
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to update course status';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addOutcome = () => {
    if (outcomesInput.trim()) {
      setFormData({
        ...formData,
        outcomes: [...(formData.outcomes || []), outcomesInput.trim()]
      });
      setOutcomesInput('');
    }
  };

  const removeOutcome = (index: number) => {
    const newOutcomes = formData.outcomes?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, outcomes: newOutcomes });
  };

  const addCurriculumItem = () => {
    if (curriculumInput.trim()) {
      setFormData({
        ...formData,
        curriculum: [...(formData.curriculum || []), curriculumInput.trim()]
      });
      setCurriculumInput('');
    }
  };

  const removeCurriculumItem = (index: number) => {
    const newCurriculum = formData.curriculum?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      price: 0,
      duration: '',
      level: 'Beginner',
      image: '',
      outcomes: [],
      curriculum: []
    });
    setOutcomesInput('');
    setCurriculumInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCourseClick = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 text-sm lg:text-base">Manage courses and view course information</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
          <Button 
            onClick={handleCreateCourse} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create Course</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button 
            onClick={fetchCourses} 
            disabled={loading} 
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Reload</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses by title, description, or instructor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 sm:max-w-xs">
              <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              <div className="flex-1 sm:max-w-xs">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <CheckCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Courses ({pagination.total})
          </CardTitle>
              <CardDescription className="mt-1">
            Showing {courses.length} of {pagination.total} courses
          </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Grid3X3 className="w-3 h-3 mr-1" />
                Grid View
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
              {/* Grid Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                      // increase card shadow
                      // make border radius in all corner
                  <Card key={course.id} className="group shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 bg-white rounded-xl border-gray-200  hover:scale-[1.02]" onClick={() => handleCourseClick(course)}>
                    <CardContent className="p-4 bg-white">
                      {/* Course Image/Thumbnail */}
                      <div className="relative h-48 bg-white  rounded-lg from-blue-50 via-indigo-50 to-purple-100 rounded-t-xl overflow-hidden">
                        {course.image ? (
                          <img
                            src={getImageUrl(course.image)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Hide image and show fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex flex-col items-center justify-center ${course.image ? 'hidden' : ''}`}>
                          <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 mb-3 shadow-lg">
                            <BookOpen className="w-12 h-12 text-blue-500" />
                            </div>
                          <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Course</p>
                            <p className="text-xs text-gray-500">No image available</p>
                          </div>
                          </div>
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(course.isActive)}
                          </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
                            {course.level}
                          </Badge>
                          </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-4 space-y-3">
                        {/* Course Title & Description */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        {/* Course Meta Info */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate">{course.instructor}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center font-semibold text-green-600">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{formatPrice(course.price)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Created Date */}
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Created: {formatDate(course.created_at)}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(course)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Course Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {course.title}
                                  </DialogDescription>
                                </DialogHeader>
                                {detailsLoading ? (
                                  <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    <p>Loading course details...</p>
                                  </div>
                                ) : courseDetails ? (
                                  <div className="space-y-6">
                                    {/* Course Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Course Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div><strong>Title:</strong> {courseDetails.course.title}</div>
                                          <div><strong>Instructor:</strong> {courseDetails.course.instructor}</div>
                                          <div><strong>Category:</strong> {courseDetails.course.category}</div>
                                          <div><strong>Level:</strong> {courseDetails.course.level}</div>
                                          <div><strong>Price:</strong> {formatPrice(courseDetails.course.price)}</div>
                                          <div><strong>Duration:</strong> {courseDetails.course.duration} hours</div>
                                          <div><strong>Status:</strong> {getStatusBadge(courseDetails.course.isActive)}</div>
                                          <div><strong>Created:</strong> {formatDate(courseDetails.course.created_at)}</div>
                                        </CardContent>
                                      </Card>
                                      
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Statistics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            <strong>Total Enrollments:</strong> {courseDetails.stats.total_enrollments}
                                          </div>
                                          <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            <strong>Active Enrollments:</strong> {courseDetails.stats.active_enrollments}
                                          </div>
                                          <div className="flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                                            <strong>Completed:</strong> {courseDetails.stats.completed_enrollments}
                                          </div>
                                          <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                                            <strong>Total Revenue:</strong> {formatPrice(courseDetails.stats.total_revenue)}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Description */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Description</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700">{courseDetails.course.description}</p>
                                      </CardContent>
                                    </Card>

                                    {/* Learning Outcomes */}
                                    {courseDetails.course.outcomes && courseDetails.course.outcomes.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Learning Outcomes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <ul className="space-y-2">
                                            {courseDetails.course.outcomes.map((outcome: string, index: number) => (
                                              <li key={index} className="flex items-start">
                                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{outcome}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Curriculum */}
                                    {courseDetails.course.curriculum && courseDetails.course.curriculum.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Course Curriculum</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            {courseDetails.course.curriculum.map((item: string, index: number) => (
                                              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                                  {index + 1}
                                                </div>
                                                <span className="text-gray-700">{item}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Enrollments */}
                                    {courseDetails.enrollments.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Recent Enrollments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            {courseDetails.enrollments.slice(0, 5).map((enrollment: any, index: number) => (
                                              <div key={index} className="p-3 border rounded-lg">
                                                <div className="font-medium">{enrollment.user_name}</div>
                                                <div className="text-sm text-gray-500">
                                                  {enrollment.user_email} | Status: {enrollment.status} | Enrolled: {formatDate(enrollment.enrolled_at)}
                                                </div>
                                              </div>
                                            ))}
                                            {courseDetails.enrollments.length > 5 && (
                                              <div className="text-sm text-gray-500 text-center">
                                                ... and {courseDetails.enrollments.length - 5} more enrollments
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                ) : null}
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCourse(course)}
                              className="h-8 px-3 text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                              onClick={() => handleToggleStatus(course.id, course.isActive)}
                              disabled={processingId === course.id}
                                className="text-orange-600"
                            >
                              {processingId === course.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : course.isActive ? (
                                  <XCircle className="w-4 h-4 mr-2" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                {course.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={processingId === course.id}
                                className="text-red-600"
                            >
                              {processingId === course.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                  <Trash2 className="w-4 h-4 mr-2" />
                              )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                    ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 px-6 sm:px-8 lg:px-12">
                  <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                      className="h-9 px-4"
                  >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">←</span>
                  </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i;
                        if (pageNum > pagination.pages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-9 w-9 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                      className="h-9 px-4"
                  >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">→</span>
                  </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  placeholder="Instructor name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (ETB) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 14 weeks"
                  required
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Course description"
                rows={4}
                required
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label htmlFor="image">Cover Image</Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Course cover preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload course cover image</p>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Choose Image
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div>
              <Label>Learning Outcomes</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={outcomesInput}
                    onChange={(e) => setOutcomesInput(e.target.value)}
                    placeholder="Add a learning outcome"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                  />
                  <Button type="button" onClick={addOutcome} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.outcomes && formData.outcomes.length > 0 && (
                  <div className="space-y-1">
                    {formData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{outcome}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutcome(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <Label>Course Curriculum</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={curriculumInput}
                    onChange={(e) => setCurriculumInput(e.target.value)}
                    placeholder="Add a curriculum item (e.g., Week 1: Introduction)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurriculumItem())}
                  />
                  <Button type="button" onClick={addCurriculumItem} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.curriculum && formData.curriculum.length > 0 && (
                  <div className="space-y-1">
                    {formData.curriculum.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCurriculumItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-instructor">Instructor *</Label>
                <Input
                  id="edit-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  placeholder="Instructor name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (ETB) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration *</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 14 weeks"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Course description"
                rows={4}
                required
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label htmlFor="edit-image">Cover Image</Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Course cover preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload new course cover image</p>
                    <input
                      type="file"
                      id="edit-image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="edit-image" className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Choose New Image
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div>
              <Label>Learning Outcomes</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={outcomesInput}
                    onChange={(e) => setOutcomesInput(e.target.value)}
                    placeholder="Add a learning outcome"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                  />
                  <Button type="button" onClick={addOutcome} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.outcomes && formData.outcomes.length > 0 && (
                  <div className="space-y-1">
                    {formData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{outcome}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutcome(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <Label>Course Curriculum</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={curriculumInput}
                    onChange={(e) => setCurriculumInput(e.target.value)}
                    placeholder="Add a curriculum item (e.g., Week 1: Introduction)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurriculumItem())}
                  />
                  <Button type="button" onClick={addCurriculumItem} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.curriculum && formData.curriculum.length > 0 && (
                  <div className="space-y-1">
                    {formData.curriculum.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCurriculumItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
