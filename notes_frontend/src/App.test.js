import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders Notes sidebar heading', () => {
  render(<App />);
  const heading = screen.getByText(/Notes/i);
  expect(heading).toBeInTheDocument();
});

test('new note button exists', () => {
  render(<App />);
  const newNoteBtn = screen.getByRole('button', { name: /\+/ });
  expect(newNoteBtn).toBeInTheDocument();
});
