import random
from typing import Dict

class SectorManager:
    def __init__(self):
        self.sectors = {}
        
    def load_sectors(self, sectors_data):
        """Initialize sectors from configuration"""
        self.sectors = sectors_data
        
    def get_sector_trends(self) -> Dict[str, float]:
        """Generate daily trends for each sector"""
        trends = {}
        for sector_name in self.sectors.keys():
            # Base trend plus some randomness
            base_trend = random.uniform(-0.02, 0.02)
            # Occasionally stronger trends
            if random.random() < 0.1:
                base_trend *= 3
            trends[sector_name] = base_trend
        return trends