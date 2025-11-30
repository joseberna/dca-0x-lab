import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toast } from '../components/Toast'

describe('Toast Component', () => {
  it('renders success toast correctly', () => {
    const mockToast = {
      id: '1',
      type: 'success' as const,
      title: 'Success!',
      message: 'Operation completed',
      duration: 5000,
    }

    const { container } = render(
      <Toast toast={mockToast} onClose={() => {}} />
    )

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
    expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument()
  })

  it('renders error toast correctly', () => {
    const mockToast = {
      id: '2',
      type: 'error' as const,
      title: 'Error!',
      message: 'Something went wrong',
      duration: 5000,
    }

    render(<Toast toast={mockToast} onClose={() => {}} />)

    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders toast without message', () => {
    const mockToast = {
      id: '3',
      type: 'info' as const,
      title: 'Info',
      duration: 5000,
    }

    render(<Toast toast={mockToast} onClose={() => {}} />)

    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.queryByText('Operation completed')).not.toBeInTheDocument()
  })
})
