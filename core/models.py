from __future__ import unicode_literals

from django.db import models


# Create your models here.

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    worth = models.FloatField(blank=True, null=True, default=1)
    estimated_time = models.FloatField(blank=True, null=True, default=0)
    parent = models.ForeignKey("self", blank=True, null=True)
    time_spent = models.FloatField(default=0)

class QuickList(models.Model):
    title = models.CharField(max_length=100)

class QuickListRelation(models.Model):
    member = models.ForeignKey("Task")
    list = models.ForeignKey("QuickList")

'''
class Link(models.Model):
    type = models.CharField(max_length=100)
    fr = models.ForeignKey("Task", related_name="fr")
    to = models.ForeignKey("Task", related_name="to")
'''

class TimeTrack(models.Model):
    from datetime import datetime

    task = models.ForeignKey( "Task" )
    #in seconds
    amt = models.IntegerField(default=10)
    logged_at = models.DateTimeField(default=datetime.now)
    happened_at = models.DateTimeField(default=datetime.now)

class TimeTrack2( models.Model ):
    from datetime import datetime

    task = models.ForeignKey( "Task" )
    start = models.DateTimeField(blank=True, null=True)
    end = models.DateTimeField(blank=True, null=True)