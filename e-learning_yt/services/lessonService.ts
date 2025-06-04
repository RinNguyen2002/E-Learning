import { Lesson } from '@/types/course'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

interface CreateLessonData {
  title: string
  content?: string | null
  videoUrl?: string | null
  order: number
  isFree: boolean
  course: number
}

export const lessonService = {
  async getLessonsByCourseId(courseId: number, jwt: string): Promise<Lesson[]> {
    try {
      console.log(`🔍 Fetching lessons for course ${courseId}`)
      const response = await fetch(
        `${API_URL}/api/lessons?filters[course][id][$eq]=${courseId}&sort=order:asc`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to fetch lessons:', response.status, errorText)
        throw new Error(`Failed to fetch lessons: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Fetched ${data.data.length} lessons for course ${courseId}`)
      return data.data
    } catch (error) {
      console.error('Error fetching lessons:', error)
      throw error
    }
  },

  async createLesson(lessonData: CreateLessonData, jwt: string): Promise<Lesson> {
    try {
      console.log('📝 Creating lesson:', lessonData)
      const response = await fetch(`${API_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: lessonData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Failed to create lesson:', response.status, errorData)
        throw new Error(errorData.error?.message || `Failed to create lesson: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Lesson created successfully:', data.data)
      return data.data
    } catch (error) {
      console.error('Error creating lesson:', error)
      throw error
    }
  },

  async updateLesson(id: number, lessonData: Partial<Omit<Lesson, 'id' | 'course' | 'createdAt' | 'updatedAt' | 'publishedAt'>>, jwt: string): Promise<Lesson> {
    try {
      console.log(`✏️ Updating lesson ${id}:`, lessonData)
      const response = await fetch(`${API_URL}/api/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: lessonData
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to update lesson ${id}:`, response.status, errorText)
        throw new Error(`Failed to update lesson: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Lesson ${id} updated successfully:`, data.data)
      return data.data
    } catch (error) {
      console.error('Error updating lesson:', error)
      throw error
    }
  },

  async deleteLesson(id: number, jwt: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting lesson ${id}`)
      const response = await fetch(`${API_URL}/api/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to delete lesson ${id}:`, response.status, errorText)
        throw new Error(`Failed to delete lesson: ${response.status}`)
      }

      console.log(`✅ Lesson ${id} deleted successfully`)
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error
    }
  },

  async reorderLessons(courseId: number, lessons: Array<{ id: number; order: number }>, jwt: string): Promise<void> {
    try {
      console.log(`🔄 Reordering ${lessons.length} lessons for course ${courseId}`)
      const promises = lessons.map(lesson => 
        this.updateLesson(lesson.id, { order: lesson.order }, jwt)
      )
      
      await Promise.all(promises)
      console.log('✅ Lessons reordered successfully')
    } catch (error) {
      console.error('Error reordering lessons:', error)
      throw error
    }
  }
} 