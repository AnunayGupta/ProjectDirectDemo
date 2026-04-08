import { render, screen, fireEvent } from '@testing-library/react'
import ClientTile from '@/components/ClientTile'

describe('ClientTile Component', () => {
  const mockClient = {
    id: "client_1",
    name: "Aoife Murphy",
    advisorId: "advisor_tom",
    totalValue: 102400,
    monthlyPerformance: -0.8,
    lastRebalanced: "2025-12-04T00:00:00Z",
    draftStartedAt: "2026-03-02T00:00:00Z",
    sentForApprovalAt: null,
    noteCount: 5
  }

  const advisor = { id: "advisor_tom", name: "Tom Clinch", title: "Managing Director", photo: "", initials: "TC" }
  const mockPortfolios = {
    client_1: {
      clientId: "client_1",
      totalValue: 102400,
      lastUpdated: "",
      holdings: [
        { ticker: "NVDA", name: "", assetClass: "equity" as const, currentWeighting: 10, targetWeighting: 10, value: 0, performance: 0 },
        { ticker: "TSLA", name: "", assetClass: "equity" as const, currentWeighting: 10, targetWeighting: 10, value: 0, performance: 0 },
      ]
    }
  }

  it('renders standard state correctly', () => {
    render(<ClientTile client={mockClient} advisor={advisor} portfolio={mockPortfolios.client_1} isSelected={false} reviewedAt={null} onToggle={() => {}} />)
    expect(screen.getByText('Aoife Murphy')).toBeInTheDocument()
    // It should format the currency using utils implicitly, just check the value text
    expect(screen.getByText('€102,400')).toBeInTheDocument()
    expect(screen.getByText('Tom Clinch — Managing Director')).toBeInTheDocument()
    expect(screen.getByText('NVDA')).toBeInTheDocument()
    expect(screen.getByText('TSLA')).toBeInTheDocument()
    expect(screen.getByText('0.8% this month')).toBeInTheDocument() // Using absolute value since it formats with down arrow
  })

  it('handles toggle selection interaction', () => {
    const onToggleMock = jest.fn()
    render(<ClientTile client={mockClient} advisor={advisor} portfolio={mockPortfolios.client_1} isSelected={false} reviewedAt={null} onToggle={onToggleMock} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(onToggleMock).toHaveBeenCalledTimes(1)
  })
})
