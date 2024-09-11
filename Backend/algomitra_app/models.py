from django.db import models

class Stock(models.Model):
    name_of_company = models.CharField(max_length=255)
    symbol = models.CharField(max_length=10, unique=True)
    token = models.CharField(max_length=255, null=True, blank=True)  # Add token if applicable

    def __str__(self):
        return f"{self.name_of_company} ({self.symbol})"
