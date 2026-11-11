"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { AssignTeacherDialog } from "./assign-teacher-dialog";
import { CourseDetail } from "./course-detail";
import type { SectionState } from "./course-detail";
import { CourseFormDialog } from "./course-form-dialog";
import { activeSchoolYear, canManageSchool, courseLabel } from "./school-rules";
import {
    COURSE_LOAD_ERROR_TEXT,
    COURSE_UPDATED_TEXT,
    FORBIDDEN_TEXT,
    NOT_FOUND_TEXT,
    SECTION_ERROR_TEXT,
    TEACHER_ASSIGNED_TEXT,
} from "./school-texts";
import { errorInfo, useCourseAssignments, useCourseStudentsPreview, useCourses } from "./use-school-data";

type QueryLike<T> = { isPending: boolean; isError: boolean; error: unknown; data: T | undefined };

function sectionOf<T>(query: QueryLike<T>): SectionState<T> {
    if (query.isPending) return { status: "loading" };
    if (query.isError || query.data === undefined) return { status: "error", message: errorInfo(query.error, SECTION_ERROR_TEXT).message };
    return { status: "ready", data: query.data };
}

// Back no tiene GET /courses/:id: el curso sale de GET /courses (ya en caché si viene de la lista)
function CourseDetailContent({ courseId }: { courseId: string }) {
    const { showToast } = useToast();
    const courses = useCourses();
    const assignments = useCourseAssignments(courseId);
    const students = useCourseStudentsPreview(courseId);
    const [dialog, setDialog] = useState<"none" | "edit" | "assign">("none");

    if (courses.isPending) {
        return (
            <div className="rounded-2xl border border-line bg-surface p-4">
                <SkeletonLines lines={6} />
            </div>
        );
    }
    if (courses.isError) {
        return <ErrorState message={errorInfo(courses.error, COURSE_LOAD_ERROR_TEXT).message} onRetry={() => void courses.refetch()} />;
    }

    const course = courses.data.find((item) => item.id === courseId);
    if (!course) return <EmptyState title={NOT_FOUND_TEXT} />;

    const assignmentsData = assignments.data?.subjects;

    return (
        <>
            <CourseDetail
                course={course}
                assignments={sectionOf({ ...assignments, data: assignmentsData })}
                students={sectionOf(students)}
                onRetryAssignments={() => void assignments.refetch()}
                onRetryStudents={() => void students.refetch()}
                onEdit={() => setDialog("edit")}
                onAssign={() => setDialog("assign")}
            />
            <CourseFormDialog
                open={dialog === "edit"}
                course={course}
                courses={courses.data}
                defaultSchoolYear={activeSchoolYear(null, courses.data)}
                onOpenChange={(open) => !open && setDialog("none")}
                onSaved={() => {
                    setDialog("none");
                    showToast(COURSE_UPDATED_TEXT);
                }}
            />
            <AssignTeacherDialog
                open={dialog === "assign"}
                courseId={course.id}
                courseName={courseLabel(course)}
                onOpenChange={(open) => !open && setDialog("none")}
                onAssigned={() => {
                    setDialog("none");
                    showToast(TEACHER_ASSIGNED_TEXT);
                }}
            />
        </>
    );
}

export function CourseDetailScreen() {
    const { active } = useSession();
    const params = useParams<{ id: string }>();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <CourseDetailContent courseId={params.id} />;
}
