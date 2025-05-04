import random
from typing import Dict, List

class EventGenerator:
    def __init__(self):
        self.event_types = {
            'market_crash': {'weight': 0.05, 'impact': -0.3},
            'market_rally': {'weight': 0.07, 'impact': 0.2},
            'sector_boom': {'weight': 0.1, 'impact': 0.15},
            'sector_bust': {'weight': 0.1, 'impact': -0.15},
            'company_scandal': {'weight': 0.03, 'impact': -0.5},
            'company_breakthrough': {'weight': 0.03, 'impact': 0.5},
            'interest_rate_change': {'weight': 0.05, 'impact': 0.1},
            'normal_day': {'weight': 0.57, 'impact': 0}
        }
        
    def generate_daily_events(self) -> List[Dict]:
        """Generate today's market events based on weighted probabilities"""
        events = []
        total_weight = sum(event['weight'] for event in self.event_types.values())
        
        # Determine if a special event occurs today (15% chance)
        if random.random() < 0.15:
            chosen_event = random.choices(
                list(self.event_types.keys()),
                weights=[e['weight'] for e in self.event_types.values()],
                k=1
            )[0]
            
            event_data = self.event_types[chosen_event]
            events.append({
                'type': chosen_event,
                'impact': event_data['impact'],
                'description': self._generate_event_description(chosen_event)
            })
            
        return events
        
    def _generate_event_description(self, event_type: str) -> str:
        """Generate a realistic description for the event"""
        descriptions = {
            'market_crash': "Panic selling grips the market as major indices plummet",
            'market_rally': "Investor optimism fuels broad market gains",
            'sector_boom': "Strong performance in this sector attracts investor interest",
            'sector_bust': "Sector-wide selloff as growth concerns emerge",
            'company_scandal': "Executive misconduct revealed, sparking investor outrage",
            'company_breakthrough': "Groundbreaking product announcement surprises market",
            'interest_rate_change': "Central bank adjusts rates, sending shockwaves through markets",
            'normal_day': "Market shows modest activity with no major developments"
        }
        return descriptions.get(event_type, "Market event occurs")