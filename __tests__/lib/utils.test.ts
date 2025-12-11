import { cn } from '@/lib/utils'

describe('utils', () => {
    describe('cn (className merge utility)', () => {
        it('should merge class names correctly', () => {
            const result = cn('btn', 'btn-primary')
            expect(result).toBe('btn btn-primary')
        })

        it('should handle conditional classes', () => {
            const result = cn('btn', { 'btn-active': true, 'btn-disabled': false })
            expect(result).toBe('btn btn-active')
        })

        it('should handle array of classes', () => {
            const result = cn(['btn', 'btn-primary'])
            expect(result).toBe('btn btn-primary')
        })

        it('should merge Tailwind classes and remove conflicts', () => {
            const result = cn('px-2 py-1', 'px-4')
            // tailwind-merge should keep only px-4 (the later one)
            expect(result).toBe('py-1 px-4')
        })

        it('should handle undefined and null values', () => {
            const result = cn('btn', undefined, null, 'btn-primary')
            expect(result).toBe('btn btn-primary')
        })

        it('should handle empty input', () => {
            const result = cn()
            expect(result).toBe('')
        })

        it('should handle complex combinations', () => {
            const isActive = true
            const isDisabled = false
            const result = cn(
                'btn',
                isActive && 'btn-active',
                isDisabled && 'btn-disabled',
                'text-white'
            )
            expect(result).toBe('btn btn-active text-white')
        })
    })
})
