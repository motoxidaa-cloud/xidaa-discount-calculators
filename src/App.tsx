import React from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { OrderForm } from './components/OrderForm';
import { ResultsScreen } from './components/ResultsScreen';
import { OrderHistory } from './components/OrderHistory';
import { PrintOrderSummary } from './components/PrintOrderSummary';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useApp } from './context/AppContext';

export const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full">
      <ErrorBoundary>
        {activeView === 'home' && <HomeScreen />}
        {activeView === 'order-form' && <OrderForm />}
        {activeView === 'results' && <ResultsScreen />}
        {activeView === 'history' && <OrderHistory />}
        {activeView === 'print-summary' && <PrintOrderSummary />}
        {activeView === 'admin-settings' && <AdminSettingsModal />}
      </ErrorBoundary>
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Header />
      <MainContent />
      
      {/* Clean Minimal Footer */}
      <footer className="no-print bg-white border-t border-gray-200 py-4 text-xs text-gray-500 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="font-bold text-gray-800">Xidaa Moto Private Limited</span>
            <span>•</span>
            <span className="text-[11px] text-gray-500">Ride the Electric Thunder</span>
          </div>

          <div className="text-[11px] text-gray-400">
            B2B Commercial Engine • v2.0 Mobile-First
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default App;
