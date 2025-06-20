
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccessDeniedStateProps {
  title: string;
  message: string;
  onGoHome: () => void;
}

export const AccessDeniedState = ({ title, message, onGoHome }: AccessDeniedStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={onGoHome}>
              Terug naar home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
