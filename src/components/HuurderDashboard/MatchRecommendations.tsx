import React from 'react';
import { MatchResult } from '@/services/MatchingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Euro, 
  Bed, 
  Home, 
  Star, 
  Heart,
  Eye,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchRecommendationsProps {
  recommendations: MatchResult[];
  isLoading: boolean;
  onRefresh?: () => void;
  onViewProperty?: (propertyId: string) => void;
}

const MatchRecommendations: React.FC<MatchRecommendationsProps> = ({
  recommendations,
  isLoading,
  onRefresh,
  onViewProperty
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aanbevolen Woningen</h3>
          <Button variant="outline" size="sm" disabled>
            Vernieuwen
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Aanbevolen Woningen
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            Geen aanbevelingen gevonden. Vul je profiel verder in voor betere resultaten.
          </p>
          <Button onClick={onRefresh} variant="outline">
            Opnieuw zoeken
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Aanbevolen Woningen
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="text-xs"
        >
          Vernieuwen
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.slice(0, 4).map((match, _) => (
            <div key={match.property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm line-clamp-2">
                  {match.property.titel || 'Onbekende woning'}
                </h4>
                <Badge variant="secondary" className="ml-2">
                  {match.score}% match
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{match.property.stad}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  <span>€{match.property.huurprijs}/maand</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  <span>{match.property.aantal_kamers} kamers</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <span className="capitalize">{match.property.woning_type}</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Match score</span>
                  <span>{match.score}%</span>
                </div>
                <Progress value={match.score} className="h-2" />
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs h-8 flex-1"
                  onClick={() => onViewProperty?.(match.property.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Bekijken
                </Button>
                <Button 
                  size="sm" 
                  className="text-xs h-8 flex-1"
                  onClick={() => navigate(`/property/${match.property.id}`)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Aanvragen
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length > 4 && (
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={() => navigate('/property-search')}
            >
              Bekijk alle {recommendations.length} aanbevelingen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchRecommendations;
