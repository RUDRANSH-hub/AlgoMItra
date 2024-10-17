# CandleCheck.py

class CandleCheck:
    """Class to check different candlestick patterns."""
    
    def check_doji(self, open_price, close_price, high_price, low_price):
        """ Check if it's a Doji candlestick """
        body_size = abs(open_price - close_price)
        total_range = high_price - low_price
        return body_size <= 0.1 * total_range  # Example condition for a Doji

    def check_morning_star(self, open_price, close_price, high_price, low_price):
        """ Check if it's a Morning Star candlestick """
        # Placeholder logic: Implement your actual Morning Star detection logic
        return open_price < close_price and low_price < (open_price + close_price) / 2

    def check_evening_star(self, open_price, close_price, high_price, low_price):
        """ Check if it's an Evening Star candlestick """
        # Placeholder logic: Implement your actual Evening Star detection logic
        return open_price > close_price and high_price > (open_price + close_price) / 2

    # Add more pattern checks here...

    def get_candlestick_patterns(self):
        """
        Return a dictionary of pattern names and their corresponding check methods.
        """
        return {
            "Doji": self.check_doji,
            
            # Add more patterns here...
        }
