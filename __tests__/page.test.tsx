import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the BiteCraft OS heading', () => {
    render(<Home />)
    
    // Check if the main heading is present
    const heading = screen.getByText(/Modern Restaurant/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders login and register buttons', () => {
    render(<Home />)
    
    // Check for the call to action buttons
    const loginButton = screen.getByRole('link', { name: /စနစ်ထဲသို့ ဝင်ရောက်ရန်/i })
    const registerButton = screen.getByRole('link', { name: /အကောင့်အသစ်ဖွင့်ရန်/i })
    
    expect(loginButton).toBeInTheDocument()
    expect(registerButton).toBeInTheDocument()
    expect(loginButton).toHaveAttribute('href', '/login')
    expect(registerButton).toHaveAttribute('href', '/register')
  })
})
