import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../AuthProvider';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { email: 'test@example.com' },
    signOut: jest.fn(),
  })),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe('Inventory Management App Test Cases', () => {
  // Render the App with required Providers
  const renderApp = () =>
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

  test('Renders the Toolify Navbar', () => {
    renderApp();
    const navbarTitle = screen.getByText(/Toolify/i);
    expect(navbarTitle).toBeInTheDocument();
  });

  test('Drawer opens when menu icon is clicked', () => {
    renderApp();
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    const drawerContent = screen.getByText(/Tool List/i);
    expect(drawerContent).toBeInTheDocument();
  });

  test('Redirects to Login Page when clicking Login', async () => {
    renderApp();
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    const loginLink = screen.getByText(/Login/i);
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Login to Toolify/i })).toBeInTheDocument();
    });
  });

  test('Dark Mode Toggle works correctly', () => {
    renderApp();
    const darkModeButton = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(darkModeButton);

    const body = document.body;
    expect(body).toHaveStyle('background-color: #121212'); // Checks if dark mode is applied
  });

  test('Handles invalid login attempts', async () => {
    renderApp();
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    const loginLink = screen.getByText(/Login/i);
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Login to Toolify/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('Sign Up button redirects to the Sign Up page', async () => {
    renderApp();
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    const signUpLink = screen.getByText(/Sign Up/i);
    fireEvent.click(signUpLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create an Account/i })).toBeInTheDocument();
    });
  });
});
