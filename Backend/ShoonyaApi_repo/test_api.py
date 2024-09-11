from api_helper import ShoonyaApiPy
from datetime import datetime
import json
import pyotp
import logging
#enable dbug to see request and 

logging.basicConfig(level=logging.DEBUG)
token = "A4CT2HP2J5QH3UKWD4X7QI77QAN7ZO64"
otp = pyotp.TOTP(token).now()
api = ShoonyaApiPy()

user = "FA120066"
pwd = "Qwerty@4321"
factor2 = otp
vc = "FA120066_U"
app_key = "69502fab0cb579fcd1432137085347e8"
imei = "abc1234"

pnl = 0

ret = api.login(
    userid=user,
    password=pwd,
    twoFA=factor2,
    vendor_code=vc,
    api_secret=app_key,
    imei=imei,
)

lastBusDay = datetime.today()
lastBusDay = lastBusDay.replace(hour=0, minute=0, second=0, microsecond=0)
ret = api.get_time_price_series(exchange='NSE', token='26000', starttime=lastBusDay.timestamp(), interval=1)
