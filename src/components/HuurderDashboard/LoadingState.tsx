
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Laden...</h2>
            <p className="text-gray-600">Dashboard wordt geladen...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
