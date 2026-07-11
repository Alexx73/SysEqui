import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import ToastProvider from './components/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </ToastProvider>
);
