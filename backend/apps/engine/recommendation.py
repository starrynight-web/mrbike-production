from typing import List, Dict, Any

class RecommendationEngine:
    """
    Contextual Emotional Recommendation Engine for MrBikeBD.
    Initial implementation is rule-based.
    """
    
    @staticmethod
    def get_similar_bikes(bike: Dict[str, Any], all_bikes: List[Dict[str, Any]], limit: int = 4) -> List[Dict[str, Any]]:
        """
        Logic for 'Similar Bikes' section on bike detail page.
        Inputs: Category, Price range (±15%), CC range, Popularity factor.
        """
        similar = []
        
        target_category = bike.get('category')
        target_price = bike.get('price', 0)
        target_cc = bike.get('cc', 0)
        
        for b in all_bikes:
            if b['id'] == bike['id']:
                continue
                
            score = 0
            
            # Same category is a must or high priority
            if b.get('category') == target_category:
                score += 50
            
            # Price range check (±15%)
            price_diff = abs(b.get('price', 0) - target_price)
            if target_price > 0 and (price_diff / target_price) <= 0.15:
                score += 30
            elif target_price > 0 and (price_diff / target_price) <= 0.25:
                score += 10
                
            # CC range matching
            cc_diff = abs(b.get('cc', 0) - target_cc)
            if cc_diff <= 10:
                score += 20
            elif cc_diff <= 50:
                score += 10
                
            # Brand demand / Popularity (placeholder)
            score += b.get('popularity_score', 0) * 10
            
            b['logic_score'] = score
            similar.append(b)
            
        # Sort by score descending
        similar.sort(key=lambda x: x['logic_score'], reverse=True)
        
        return similar[:limit]

    @staticmethod
    def get_used_bikes_near_budget(price: float, all_used_bikes: List[Dict[str, Any]], limit: int = 4) -> List[Dict[str, Any]]:
        """
        Logic for 'Used Bikes Near Your Budget' section.
        Triggers emotional buying by showing higher segment bikes at same price.
        """
        recommendations = []
        
        for b in all_used_bikes:
            score = 0
            
            # Price range check (±10%)
            price_diff = abs(b.get('price', 0) - price)
            if price > 0 and (price_diff / price) <= 0.10:
                score += 50
            elif price > 0 and (price_diff / price) <= 0.20:
                score += 20
                
            # Prefer higher segment/premium brands (emotional trigger)
            if b.get('is_premium', False):
                score += 30
            
            if b.get('is_verified_seller', False):
                score += 20
                
            b['logic_score'] = score
            recommendations.append(b)
            
        recommendations.sort(key=lambda x: x['logic_score'], reverse=True)
        
        return recommendations[:limit]
