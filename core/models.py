from __future__ import unicode_literals

from django.db import models


# Create your models here.


class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    worth = models.FloatField(blank=True, null=True, default=1)
    estimated_time = models.FloatField(blank=True, null=True, default=0)
    parent = models.ForeignKey("self", blank=True, null=True)