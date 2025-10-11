import api, { ApiResponse, handleApiError } from "./api";

export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    duration: string;
    students: number;
    rating: number;
    level: string;
    instructor: string;
    outcomes?: string[];
    curriculum?: string[];
}

export interface EnrichedCourse extends Course {
    enrollmentId?: string;
    enrolledAt?: string;
    progress?: number;
    completedLessons?: number;
    totalLessons?: number;
    nextLesson?: string;
}

export interface Enrollment {
    id: string;
    courseId: string;
    userId: string;
    enrolledAt: string;
    progress: number;
    status: "active" | "completed" | "suspended";
    course?: Course;
}

export interface EnrollmentRequest {
    courseId: string;
    paymentMethodId: string;
}

class CoursesService {
    // Get all courses
    async getAllCourses(): Promise<Course[]> {
        try {
            const response = await api.get<Course[]>("/courses/");
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    // Get course by ID
    async getCourseById(courseId: string): Promise<Course> {
        try {
            const response = await api.get<Course>(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    // Enroll in course
    async enrollInCourse(
        enrollment: EnrollmentRequest
    ): Promise<{ message: string; enrollment: Enrollment }> {
        try {
            const response = await api.post<{
                message: string;
                enrollment: Enrollment;
            }>(`/courses/${enrollment.courseId}/enroll`, enrollment);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    // Get course lessons (requires enrollment)
    async getCourseLessons(courseId: string): Promise<any[]> {
        try {
            const response = await api.get<{ lessons: any[] }>(
                `/courses/${courseId}/lessons`
            );
            return response.data.lessons;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
}

export const coursesService = new CoursesService();
