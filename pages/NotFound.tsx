import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-2xl font-medium mt-2">Page Not Found</h2>
      <p className="text-muted-foreground mt-4 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        className="mt-6" 
        onClick={() => navigate('/')}
      >
        Return to Home
      </Button>
    </div>
  );
}