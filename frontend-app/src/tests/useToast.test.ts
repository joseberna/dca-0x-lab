import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../hooks/useToast'
import { useToastStore } from '../store/useToastStore'

describe('useToast Hook', () => {
  it('should add success toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.success('Test Success', 'Success message')
    })

    const toasts = useToastStore.getState().toasts
    expect(toasts.length).toBeGreaterThan(0)
    expect(toasts[toasts.length - 1].type).toBe('success')
    expect(toasts[toasts.length - 1].title).toBe('Test Success')
  })

  it('should add error toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.error('Test Error', 'Error message')
    })

    const toasts = useToastStore.getState().toasts
    const errorToast = toasts.find(t => t.type === 'error')
    expect(errorToast).toBeDefined()
    expect(errorToast?.title).toBe('Test Error')
  })

  it('should add warning toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.warning('Test Warning', 'Warning message')
    })

    const toasts = useToastStore.getState().toasts
    const warningToast = toasts.find(t => t.type === 'warning')
    expect(warningToast).toBeDefined()
  })

  it('should add info toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.info('Test Info', 'Info message')
    })

    const toasts = useToastStore.getState().toasts
    const infoToast = toasts.find(t => t.type === 'info')
    expect(infoToast).toBeDefined()
  })
})
