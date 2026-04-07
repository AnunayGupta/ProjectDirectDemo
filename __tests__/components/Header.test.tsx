import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

describe('Header Component', () => {
  it('renders title dependent on props', () => {
    render(<Header title="Client Book" />)
    expect(screen.getByText('Client Book')).toBeInTheDocument()
  })

  it('renders the asset summary snippet', () => {
    render(<Header title="Client Book" />)
    expect(screen.getByText('Asset Summary')).toBeInTheDocument()
    expect(screen.getByText('200 clients — €142m AUM')).toBeInTheDocument()
  })

  it('renders search button', () => {
    render(<Header title="Client Book" />)
    const searchBtn = screen.getByTestId('search-btn')
    expect(searchBtn).toBeInTheDocument()
  })
})
