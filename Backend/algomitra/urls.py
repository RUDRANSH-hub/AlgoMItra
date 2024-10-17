from django.contrib import admin
from django.urls import path, include
from algomitra_app.views import RegisterAPIView, LoginAPIView,UserProfileAPIView,FetchStockPriceAPIView,FetchStockNamesAPIView,FetchHistoricalStockPriceAPIView,FetchStockDayPriceAPIView,CandleCheckAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    path('api/login/', LoginAPIView.as_view(), name='login'),
    path('api/user-profile/', UserProfileAPIView.as_view(), name='user-profile'), 
    path('api/stocks/', FetchStockNamesAPIView.as_view(), name='fetch_all_stocks'),
    # path('zerodha/login/', ZerodhaLoginAPIView.as_view(), name='zerodha-login'),
    # path('zerodha/callback/', ZerodhaCallbackAPIView.as_view(), name='zerodha-callback'),
    path('api/stocks/<str:symbol>/', FetchStockPriceAPIView.as_view(), name='fetch_stock_price'),
    path('api/historical/<str:symbol>/', FetchHistoricalStockPriceAPIView.as_view(), name='fetch_historical_stock_price'),
    path('api/dayStockData/<str:symbol>/', FetchStockDayPriceAPIView.as_view(), name='fetch_day_Stock_data'),
    path('api/candle-check/', CandleCheckAPIView.as_view(), name='candle_check'),



    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    path('accounts/', include('allauth.urls')),  # For Google OAuth
]
