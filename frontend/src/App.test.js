import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Rwanda Quantum Agricultural Intelligence', () => {
  render(<App />);
  const titleElement = screen.getByText(/Rwanda Quantum Agricultural Intelligence/i);
  expect(titleElement).toBeInTheDocument();
});