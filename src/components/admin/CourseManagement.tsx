import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, Course, CoursesResponse, CourseCreateData } from '@/services/admin';

const CourseManagement: React.FC = () => {
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
  const [formData, setFormData] = useState<CourseCreateData>({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    duration: '',
    level: 'Beginner'
  });
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
      setError(err.response?.data?.detail || 'Failed to fetch courses');
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
      level: course.level
    });
    setShowEditDialog(true);
  };

  const handleCreateCourse = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      price: 0,
      duration: '',
      level: 'Beginner'
    });
    setShowCreateDialog(true);
  };

  const handleSubmitCreate = async () => {
    try {
      setLoading(true);
      await adminService.createCourse(formData);
      toast({
        title: "Course Created",
        description: "Course created successfully",
      });
      setShowCreateDialog(false);
      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.detail || 'Failed to create course',
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
      await adminService.updateCourse(editingCourse.id, formData);
      toast({
        title: "Course Updated",
        description: "Course updated successfully",
      });
      setShowEditDialog(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.detail || 'Failed to update course',
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
      toast({
        title: "Error",
        description: err.response?.data?.detail || 'Failed to delete course',
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
      toast({
        title: "Error",
        description: err.response?.data?.detail || 'Failed to update course status',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">Manage courses and view course information</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCreateCourse} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
          <Button onClick={fetchCourses} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses by title, description, or instructor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                <SelectTrigger>
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
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Courses ({pagination.total})
          </CardTitle>
          <CardDescription>
            Showing {courses.length} of {pagination.total} courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No courses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {course.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{course.instructor}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            {formatPrice(course.price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {course.duration}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {formatDate(course.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(course)}
                                >
                                  <Eye className="w-4 h-4" />
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
                                          <div><strong>Created:</strong> {formatDate(courseDetails.course.createdAt)}</div>
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
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant={course.isActive ? "destructive" : "default"}
                              onClick={() => handleToggleStatus(course.id, course.isActive)}
                              disabled={processingId === course.id}
                            >
                              {processingId === course.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : course.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={processingId === course.id}
                            >
                              {processingId === course.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (ETB)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 14 weeks"
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Course description"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Input
                  id="edit-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (ETB)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 14 weeks"
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Course description"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={loading}>
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
