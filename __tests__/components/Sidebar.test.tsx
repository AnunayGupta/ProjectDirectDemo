import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'
// Since Sidebar might use usePathname from next/navigation, mock it
jest.mock('next/navigation', () => ({
  usePathname: () => '/clients',
}))

describe('Sidebar Component', () => {
  it('renders CLINCH logo', () => {
    render(<Sidebar />)
    expect(screen.getByText('CLINCH')).toBeInTheDocument()
    expect(screen.getByText('Wealth Management')).toBeInTheDocument()
  })

  it('renders standard navigation items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays the logged in advisor profile', () => {
    render(<Sidebar />)
    expect(screen.getByText('Andrew Collins')).toBeInTheDocument()
    expect(screen.getByText('Director')).toBeInTheDocument()
    const img = screen.getByTestId('advisor-photo')
    expect(img).toHaveAttribute('src', '/advisors/andrew-collins.jpg')
  })
})
