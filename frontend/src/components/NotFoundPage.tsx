import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2F7F4] flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="text-8xl font-bold text-[#2E7D55] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#1E3A2F] mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#1E3A2F] hover:bg-[#2E7D55] text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
