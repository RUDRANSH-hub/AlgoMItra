import logging
import pyotp
from datetime import datetime, timedelta
import pytz  # For timezone handling
from ShoonyaApi_repo.api_helper import ShoonyaApiPy
from django.conf import settings

class ShoonyaService:
    SESSION_EXPIRY_BUFFER = 5  # Minutes before session expiry to refresh
    SESSION_DURATION = 30  # Estimated session duration in minutes
    WEEKEND_DAYS = {5, 6}  # Saturday (5) and Sunday (6)
    MAX_RETRIES = 3  # Number of retries for API calls

    def __init__(self):
        self.api = ShoonyaApiPy()
        self.session = None
        self.session_expiry = None  # Store session expiry time
        self.ist = pytz.timezone('Asia/Kolkata')  # Indian Standard Time (IST)

    def login(self):
        """
        Perform login to the Shoonya API and store session details.
        """
        try:
            otp = pyotp.TOTP(settings.SHOONYA_API_TOKEN).now()
            logging.debug(f"Generated OTP: {otp}")

            ret = self.api.login(
                userid=settings.SHOONYA_USER_ID,
                password=settings.SHOONYA_PASSWORD,
                twoFA=otp,
                vendor_code=settings.SHOONYA_VENDOR_CODE,
                api_secret=settings.SHOONYA_API_SECRET,
                imei=settings.SHOONYA_IMEI,
            )

            logging.debug(f"Login response: {ret}")  # Log the login response

            if ret and ret.get('stat') == 'Ok':
                logging.info("Login successful.")
                self.session = ret  # Save session information for future requests
                self.session_expiry = datetime.now(self.ist) + timedelta(minutes=self.SESSION_DURATION)
            else:
                logging.error(f"Login failed: {ret}")  # Log detailed error
                raise Exception(f"Login failed: {ret}")
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            raise

    def is_session_valid(self):
        """
        Check if the session is valid and not expired.
        Returns True if valid, otherwise False.
        """
        if self.session and self.session_expiry:
            remaining_time = self.session_expiry - datetime.now(self.ist)
            if remaining_time > timedelta(minutes=self.SESSION_EXPIRY_BUFFER):
                return True
        return False

    def ensure_valid_session(self):
        """
        Ensure that the session is valid before making any API requests.
        Re-login if the session has expired or is close to expiring.
        """
        if not self.is_session_valid():
            logging.info("Session expired or about to expire. Logging in again.")
            self.login()

    def fetch_stock_data_with_retry(self, fetch_function, *args, retries=MAX_RETRIES):
        """
        Retry logic for fetching stock data to handle intermittent API failures.
        """
        for attempt in range(retries):
            try:
                return fetch_function(*args)
            except Exception as e:
                logging.error(f"Attempt {attempt + 1} of {retries} failed. Error: {str(e)}")
                if attempt == retries - 1:
                    raise
        return None

    def fetch_stock_price(self, token):
        """
        Fetch current stock price using the Shoonya API for a given stock token.
        Includes handling for weekends, after-market hours, and day change.
        """
        self.ensure_valid_session()

        current_time = datetime.now(self.ist)
        market_open_time = current_time.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = current_time.replace(hour=15, minute=30, second=0, microsecond=0)

        logging.debug(f"Current time: {current_time}")
        logging.debug(f"Market open time: {market_open_time}, Market close time: {market_close_time}")

        # Handle weekends
        if current_time.weekday() in self.WEEKEND_DAYS:
            last_trading_day = current_time - timedelta(days=(1 if current_time.weekday() == 5 else 2))
            target_start_time = last_trading_day.replace(hour=15, minute=24, second=0, microsecond=0)
            target_end_time = last_trading_day.replace(hour=15, minute=30, second=0, microsecond=0)
            logging.debug(f"Weekend detected. Fetching stock data for last 5 minutes of Friday at {target_start_time} to {target_end_time} (IST)")

        # Market closed: either before opening time or after closing time
        elif current_time < market_open_time or current_time > market_close_time:
            # If the time is past midnight but before market opening, show data from the previous trading day
            if current_time < market_open_time:
                previous_day = current_time - timedelta(days=1 if current_time.weekday() != 0 else 3)  # Adjust for Monday mornings
                logging.debug(f"Before market opens, fetching data for the last 5 minutes of the previous trading day: {previous_day}")
            else:
                previous_day = current_time

            # Fetch the last 5 minutes of the previous day (or today if after hours)
            target_start_time = previous_day.replace(hour=15, minute=24, second=0, microsecond=0)
            target_end_time = previous_day.replace(hour=15, minute=30, second=0, microsecond=0)
            logging.debug(f"Market closed. Fetching last 5 minutes of stock data for {target_start_time} to {target_end_time} (IST)")

        else:
            # Market is open, fetch the last 5 minutes of live data
            target_start_time = current_time - timedelta(minutes=5)
            target_end_time = current_time.replace(second=0, microsecond=0)
            logging.debug(f"Fetching last 5 minutes of live stock data for {target_start_time} to {target_end_time} (IST)")

        try:
            ret = self.api.get_time_price_series(
                exchange='NSE',
                token=token,
                starttime=target_start_time.timestamp(),
                endtime=target_end_time.timestamp(),
                interval=1  # 1-minute interval
            )
            logging.debug(f"Stock data response: {ret}")
            return ret
        except Exception as e:
            logging.error(f"Error fetching stock price: {str(e)}")
            raise Exception(f"Error fetching stock price: {str(e)}")

    def fetch_day_stock_price(self, token, interval_):
        """
        Fetch full day stock price data using the Shoonya API for a given stock token.
        Handles weekends, after-market hours, and day change.
        """
        self.ensure_valid_session()

        current_time = datetime.now(self.ist)
        market_open_time = current_time.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = current_time.replace(hour=15, minute=30, second=0, microsecond=0)

        logging.debug(f"Current time: {current_time}")
        logging.debug(f"Market open time: {market_open_time}, Market close time: {market_close_time}")

        # Handle weekends
        if current_time.weekday() in self.WEEKEND_DAYS:
            last_trading_day = current_time - timedelta(days=(1 if current_time.weekday() == 5 else 2))
            logging.debug(f"Weekend detected. Fetching stock data for the full day of last trading day: {last_trading_day.date()}")

            # Fetch full day's data from last trading day
            target_start_time = last_trading_day.replace(hour=9, minute=15, second=0, microsecond=0)
            target_end_time = last_trading_day.replace(hour=15, minute=30, second=0, microsecond=0)

        # Market is closed (before market opens or after market closes)
        elif current_time < market_open_time or current_time > market_close_time:
            if current_time < market_open_time:
                previous_day = current_time - timedelta(days=1 if current_time.weekday() != 0 else 3)
                logging.debug(f"Before market opens, fetching data for the full day of the previous trading day: {previous_day.date()}")
            else:
                previous_day = current_time
                logging.debug(f"After market hours, fetching full day's stock data for today: {previous_day.date()}")

            # Fetch full day's data from the previous trading day
            target_start_time = previous_day.replace(hour=9, minute=15, second=0, microsecond=0)
            target_end_time = previous_day.replace(hour=15, minute=30, second=0, microsecond=0)

        # Market is currently open, fetch from market open till now
        else:
            logging.debug(f"Market is open. Fetching stock data from market open till now for {current_time.date()}")
            target_start_time = market_open_time
            target_end_time = current_time.replace(second=0, microsecond=0)

        try:
            ret = self.api.get_time_price_series(
                exchange='NSE',
                token=token,
                starttime=target_start_time.timestamp(),
                endtime=target_end_time.timestamp(),
                interval=interval_  # Use provided interval (e.g., 1 minute, 5 minutes)
            )
            logging.debug(f"Stock data response: {ret}")
            return ret
        except Exception as e:
            logging.error(f"Error fetching stock price: {str(e)}")
            raise Exception(f"Error fetching stock price: {str(e)}")



    def fetch_historical_stock_data(self, token, start_date, end_date, interval_):
        """
        Fetch historical stock data using the Shoonya API for a given stock token.
        Start and end dates must be in 'YYYY-MM-DD' format.
        """
        self.ensure_valid_session()

        try:
            # Parse start_date and end_date in 'YYYY-MM-DD' format
            start_time = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S").replace(tzinfo=self.ist).timestamp()
            end_time = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S").replace(tzinfo=self.ist).timestamp()

            logging.debug(f"Fetching historical stock data from {start_date} to {end_date} (IST)")

            # Fetch the stock's time and price series data using the token
            ret = self.api.get_time_price_series(
                exchange='NSE',
                token=token,
                starttime=start_time,
                endtime=end_time,
                interval=interval_  # 1-minute interval data
            )

            logging.debug(f"Historical stock data response: {ret}")  # Log the response
            return ret
        except Exception as e:
            logging.error(f"Error fetching historical stock price: {str(e)}")
            raise Exception(f"Error fetching historical stock price: {str(e)}")


