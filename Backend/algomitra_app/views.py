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

from rest_framework import status
class RegisterAPIView(APIView):
    def post(self, request):
        
        email=request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password)
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
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from nsetools import Nse

import logging
logger = logging.getLogger(__name__)
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

# from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.ShoonyaService import ShoonyaService
from .models import Stock

# class FetchStockPriceAPIView(APIView):
#     """
#     Fetches the current stock price for a specific stock symbol from the database and Shoonya API.
#     """
#     def get(self, request, symbol, *args, **kwargs):
#         try:
#             # Fetch the token for the symbol from the database
#             stock = Stock.objects.filter(symbol=symbol).first()
#             if not stock:
#                 return Response({"error": "Stock symbol not found"}, status=status.HTTP_404_NOT_FOUND)

#             # Initialize the Shoonya API service
#             shoonya_service = ShoonyaService()

#             # Fetch stock data using the token from the Stock model
#             stock_data = shoonya_service.fetch_stock_price(stock.token)

#             if stock_data:
#                 return Response(stock_data, status=status.HTTP_200_OK)
#             else:
#                 return Response({"error": "No stock data found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import logging
import time

logger = logging.getLogger(__name__)

class FetchStockPriceAPIView(APIView):
    """
    Fetches the current stock price for a specific stock symbol from the database and Shoonya API.
    Implements retry logic for fetching stock data.
    """
    
    MAX_RETRIES = 3  # Maximum number of retries
    RETRY_DELAY = 2  # Delay between retries in seconds
    
    def fetch_stock_data_with_retry(self, shoonya_service, token):
        """
        Helper function to fetch stock data with retry logic.
        """
        retries = 0
        while retries < self.MAX_RETRIES:
            try:
                # Attempt to fetch stock data
                stock_data = shoonya_service.fetch_stock_price(token)
                if stock_data:
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

