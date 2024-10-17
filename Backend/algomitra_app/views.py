from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
import requests
from django.conf import settings
import http.client
from rest_framework.response import Response
from rest_framework import status
from .services.ShoonyaService import ShoonyaService
from .models import Stock
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from nsetools import Nse
import logging
import time
from datetime import datetime
logger = logging.getLogger(__name__)
from rest_framework import status
from datetime import datetime, timedelta

class RegisterAPIView(APIView):
    def post(self, request):
        
        username=request.data.get('username')
        email=request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username,email=email, password=password)
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)



class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'email': email,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            
            'email': request.user.email,
        })


class FetchStockNamesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Fetch all stocks from the Stock model
            stocks = Stock.objects.all().values('symbol', 'name_of_company', 'token')

            # Format the data for the response
            stock_list = [{"symbol": stock['symbol'], "name": stock['name_of_company'], "Token": stock['token']} for stock in stocks]

            return Response({'stocks': stock_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FetchStockPriceAPIView(APIView):
    """
    Fetches the current stock price for a specific stock symbol from the database and Shoonya API.
    Implements retry logic for fetching stock data.
    """
    
    MAX_RETRIES = 5  # Maximum number of retries
    RETRY_DELAY = 1  # Delay between retries in seconds
    
    def fetch_stock_data_with_retry(self, shoonya_service, token):
        """
        Helper function to fetch stock data with retry logic.
        """
        retries = 0
        while retries < self.MAX_RETRIES:
            try:
                # Attempt to fetch stock data
                # print("***************")
                stock_data = shoonya_service.fetch_stock_price(token)
                # print("########")
                if stock_data:
                    # print(stock_data)
                    return stock_data  # Return the data if successful
            except Exception as e:
                retries += 1
                logger.error(f"Error fetching stock data. Attempt {retries} of {self.MAX_RETRIES}. Error: {str(e)}")
                
                if retries < self.MAX_RETRIES:
                    logger.info(f"Retrying after {self.RETRY_DELAY} seconds...")
                    time.sleep(self.RETRY_DELAY)  # Delay before retrying
                else:
                    logger.error(f"Max retries reached. Failed to fetch stock data for token: {token}")
                    raise e  # Raise the exception after max retries
        
        return None

    def get(self, request, symbol, *args, **kwargs):
        try:
            # Fetch the stock by symbol (case insensitive)
            stock = Stock.objects.filter(symbol__iexact=symbol).first()
            if not stock:
                logger.error(f"Stock symbol not found: {symbol}")
                return Response({"error": f"Stock symbol '{symbol}' not found"}, status=status.HTTP_404_NOT_FOUND)

            # Initialize the Shoonya API service
            shoonya_service = ShoonyaService()

            # Fetch stock data using the token from the Stock model with retry logic
            stock_data = self.fetch_stock_data_with_retry(shoonya_service, stock.token)

            if stock_data:
                logger.info(f"Stock data fetched successfully for symbol: {symbol}")
                return Response(stock_data[0], status=status.HTTP_200_OK)
            else:
                logger.error(f"No stock data found for symbol: {symbol}")
                return Response({"error": "No stock data found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error fetching stock data for symbol {symbol}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FetchStockDayPriceAPIView(APIView):
    """
    Fetches the current stock price for a specific stock symbol from the database and Shoonya API.
    Implements retry logic for fetching stock data.
    """
    
    MAX_RETRIES = 5  # Maximum number of retries
    RETRY_DELAY = 1  # Delay between retries in seconds
    
    def fetch_stock_data_with_retry(self, shoonya_service, token,interval):
        """
        Helper function to fetch stock data with retry logic.
        """
        retries = 0
        while retries < self.MAX_RETRIES:
            try:
                # Attempt to fetch stock data
                # print("***************")
                stock_data = shoonya_service.fetch_day_stock_price(token,interval)
                # print("########")
                if stock_data:
                    # print(stock_data)
                    return stock_data  # Return the data if successful
            except Exception as e:
                retries += 1
                logger.error(f"Error fetching stock data. Attempt {retries} of {self.MAX_RETRIES}. Error: {str(e)}")
                
                if retries < self.MAX_RETRIES:
                    logger.info(f"Retrying after {self.RETRY_DELAY} seconds...")
                    time.sleep(self.RETRY_DELAY)  # Delay before retrying
                else:
                    logger.error(f"Max retries reached. Failed to fetch stock data for token: {token}")
                    raise e  # Raise the exception after max retries
        
        return None

    def post(self, request, symbol, *args, **kwargs):
        try:
            # Fetch the stock by symbol (case insensitive)
            stock = Stock.objects.filter(symbol__iexact=symbol).first()
            if not stock:
                logger.error(f"Stock symbol not found: {symbol}")
                return Response({"error": f"Stock symbol '{symbol}' not found"}, status=status.HTTP_404_NOT_FOUND)

            # Initialize the Shoonya API service
            shoonya_service = ShoonyaService()
            interval = request.data.get('interval', 1)
            # Fetch stock data using the token from the Stock model with retry logic
            stock_data = self.fetch_stock_data_with_retry(shoonya_service, stock.token,interval)

            if stock_data:
                logger.info(f"Stock data fetched successfully for symbol: {symbol}")
                return Response(stock_data, status=status.HTTP_200_OK)
            else:
                logger.error(f"No stock data found for symbol: {symbol}")
                return Response({"error": "No stock data found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error fetching stock data for symbol {symbol}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




from datetime import datetime
from django.core.cache import cache
from django.utils.timezone import now
class FetchHistoricalStockPriceAPIView(APIView):
    """
    API View to fetch historical stock data for a given symbol.
    """
    

    

    def fetch_stock_data_with_retry(self, shoonya_service, token, start_date, end_date, interval, retries=3):
        for attempt in range(retries):
            try:
                stock_data = shoonya_service.fetch_historical_stock_data(token, start_date, end_date, interval)
                if stock_data:
                    print("data fetched")
                    return stock_data
                    
            except Exception as e:
                logger.error(f"Error fetching historical stock data for token {token}. Attempt {attempt + 1} of {retries}. Error: {str(e)}")
                if attempt == retries - 1:
                    raise
        return None

    def post(self, request, symbol, *args, **kwargs):
        try:

            # Get start and end dates from the request body
            start_date = request.data.get('start_date', (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"))  # Default to a specific date
            end_date = request.data.get('end_date', datetime.now().strftime("%Y-%m-%d %H:%M:%S"))  # Include time in the end date

            # Set the interval (e.g., 1 minute)
            interval = request.data.get('interval', 1)

            # Fetch the stock by symbol
            stock = Stock.objects.filter(symbol__iexact=symbol).first()
            if not stock:
                logger.error(f"Stock symbol not found: {symbol}")
                return Response({"error": f"Stock symbol '{symbol}' not found"}, status=status.HTTP_404_NOT_FOUND)

            # Initialize the Shoonya API service
            shoonya_service = ShoonyaService()

            # Fetch stock data using the token from the Stock model with retry logic
              # Wait for a specified time before retrying

            stock_data = self.fetch_stock_data_with_retry(shoonya_service, stock.token, start_date, end_date, interval)

            if stock_data:
                print("data fetched success")   
                logger.info(f"Historical stock data fetched successfully for symbol: {symbol}")
                return Response(stock_data, status=status.HTTP_200_OK)
            else:
                logger.error(f"No historical stock data found for symbol: {symbol}")
                return Response({"error": "No historical stock data found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error fetching historical stock data for symbol {symbol}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#     def get(self,request,)

from .CandleCheck import CandleCheck

class CandleCheckAPIView(APIView):
    def post(self, request, *args, **kwargs):
        open_price = request.data.get('open')
        close_price = request.data.get('close')
        high_price = request.data.get('high')
        low_price = request.data.get('low')
        print("value of current :",open_price,close_price,high_price,low_price)
        if open_price is None or close_price is None or high_price is None or low_price is None:
            return Response(
                {"error": "Please provide open, close, high, and low values."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            open_price = float(open_price)
            close_price = float(close_price)
            high_price = float(high_price)
            low_price = float(low_price)
        except ValueError:
            return Response(
                {"error": "Please provide numeric values for open, close, high, and low."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize the CandleCheck class and get all pattern methods
        candle_checker = CandleCheck()
        patterns = candle_checker.get_candlestick_patterns()
        matched_patterns = []

        # Check each pattern and see which one returns True
        for pattern_name, pattern_func in patterns.items():
            if pattern_func(open_price, close_price, high_price, low_price):
                matched_patterns.append(pattern_name)

        if matched_patterns:
            return Response({"matched_patterns": matched_patterns}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No patterns matched."}, status=status.HTTP_200_OK)
