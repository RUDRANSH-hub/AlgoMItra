import logging
import pyotp
from datetime import datetime, timedelta
import pytz  # For timezone handling
from ShoonyaApi_repo.api_helper import ShoonyaApiPy
from django.conf import settings

class ShoonyaService:
    def __init__(self):
        self.api = ShoonyaApiPy()
        self.session = None
        self.ist = pytz.timezone('Asia/Kolkata')  # Indian Standard Time (IST)

    def login(self):
        try:
            # Generate OTP
            otp = pyotp.TOTP(settings.SHOONYA_API_TOKEN).now()
            logging.debug(f"Generated OTP: {otp}")

            # Login credentials
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
            else:
                logging.error(f"Login failed: {ret}")  # Log detailed error
                raise Exception(f"Login failed: {ret}")
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            raise

    def fetch_stock_price(self, token):
        if not self.session:
            self.login()  # Ensure the session is active before making requests

        # Get the current time in IST
        current_time = datetime.now(self.ist)
        market_open_time = current_time.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = current_time.replace(hour=15, minute=29, second=0, microsecond=0)

        # Check if the current time is before 9:15 AM
        if current_time < market_open_time:
            # Fetch the stock price for 15:29:00 of the previous day
            previous_day = current_time - timedelta(days=1)
            target_time = previous_day.replace(hour=15, minute=29, second=0, microsecond=0)
            logging.debug(f"Fetching stock data for previous day at {target_time} (IST)")
        elif current_time > market_close_time:
            # Fetch the stock price for 15:29:00 of the current day
            target_time = current_time.replace(hour=15, minute=29, second=0, microsecond=0)
            logging.debug(f"Fetching stock data for today at {target_time} (IST)")
        else:
            # Fetch the stock price for the current IST time
            target_time = current_time.replace(second=0, microsecond=0)
            logging.debug(f"Fetching stock data for the current time at {target_time} (IST)")

        # Fetch the stock's time and price series data using token
        try:
            ret = self.api.get_time_price_series(
                exchange='NSE',
                token=token,
                starttime=target_time.timestamp(),  # Fetch data for the specific target time
                interval=1  # 1-minute interval data
            )
            logging.debug(f"Stock data response: {ret}")  # Log the response
            return ret
        except Exception as e:
            logging.error(f"Error fetching stock price: {str(e)}")
            raise Exception(f"Error fetching stock price: {str(e)}")
