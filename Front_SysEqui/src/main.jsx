import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import ToastProvider from './components/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </UserProvider>
);
