import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import Dashboard from './pages/Dashboard';
import useCrimeStore from './store/crimestore';
import './App.css';
import { Notifications } from '@mantine/notifications';

function App() {
  useCrimeStore.persist.clearStorage();
  const getInitialColorScheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return "light"; // default to light mode
  };

  const [colorScheme, setColorScheme] = useState(getInitialColorScheme());

  const theme = createTheme({
    colorScheme,
    // Use a subtle professional blue palette
    colors: {
      primary: [
        '#e6f2ff', // lightest
        '#cce4ff',
        '#99c9ff',
        '#66adff',
        '#3382ff',
        '#0057e6', // main color
        '#004acb',
        '#003f9f',
        '#003570',
        '#002f50'
      ]
    },
    primaryColor: 'primary',
    primaryShade: 5,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    defaultRadius: 'md',
    components: {
      Button: { defaultProps: { radius: 'md' } }
    },
    other: {
      navbarBgDark: '#191A1E',
      navbarBgLight: '#ffffff',
      bodyBgDark: '#21222c',
      bodyBgLight: '#f8f9fa'
    }
  });

  const toggleColorScheme = (value) => {
    const newColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(newColorScheme);
    localStorage.setItem('theme', newColorScheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setColorScheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <Notifications />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard toggleColorScheme={toggleColorScheme} />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
