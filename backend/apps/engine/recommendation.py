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
        """
        similar = []
        target_category = bike.get('category')
        target_price = bike.get('price', 0)
        target_cc = bike.get('cc', 0)
        
        for b in all_bikes:
            # Skip if both IDs are missing or equal (only compare when both present and non-None)
            b_id = b.get('id')
            bike_id = bike.get('id')
            if (b_id is None and bike_id is None) or (b_id is not None and bike_id is not None and b_id == bike_id):
                continue
                
            score = 0
            if b.get('category') == target_category:
                score += 50
            
            price_diff = abs(b.get('price', 0) - target_price)
            if target_price > 0 and (price_diff / target_price) <= 0.15:
                score += 30
            elif target_price > 0 and (price_diff / target_price) <= 0.25:
                score += 10
                
            cc_diff = abs(b.get('cc', 0) - target_cc)
            if cc_diff <= 10:
                score += 20
            elif cc_diff <= 50:
                score += 10
                
            score += b.get('popularity_score', 0) * 10
            
            bike_with_score = b.copy()
            bike_with_score['logic_score'] = score
            similar.append(bike_with_score)
            
        similar.sort(key=lambda x: x['logic_score'], reverse=True)
        return similar[:limit]

    @staticmethod
    def get_used_bikes_near_budget(price: float, all_used_bikes: List[Dict[str, Any]], limit: int = 4) -> List[Dict[str, Any]]:
        """
        Logic for 'Used Bikes Near Your Budget' section.
        """
        recommendations = []
        for b in all_used_bikes:
            score = 0
            price_diff = abs(b.get('price', 0) - price)
            if price > 0 and (price_diff / price) <= 0.10:
                score += 50
            elif price > 0 and (price_diff / price) <= 0.20:
                score += 20
                
            if b.get('is_premium', False):
                score += 30
            if b.get('is_verified_seller', False):
                score += 20
                
            bike_with_score = b.copy()
            bike_with_score['logic_score'] = score
            recommendations.append(bike_with_score)
            
        recommendations.sort(key=lambda x: x['logic_score'], reverse=True)
        return recommendations[:limit]
