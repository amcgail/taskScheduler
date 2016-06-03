from __future__ import unicode_literals

from django.db import models


# Create your models here.
class Relationship(models.Model):
    parent = models.ForeignKey("Task", blank=True, null=True, related_name="child_relationships")
    child = models.ForeignKey("Task", blank=True, null=True, related_name="parent_relationships")


class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    worth = models.FloatField(blank=True, null=True, default=1)
    estimated_time = models.FloatField(blank=True, null=True, default=0)
    parent = models.ForeignKey("self", blank=True, null=True)
    time_spent = models.FloatField(default=0)


class TimeTrack(models.Model):
    from datetime import datetime

    task = models.ForeignKey( "Task" )
    #in seconds
    amt = models.IntegerField(default=10)
    logged_at = models.DateTimeField(default=datetime.now)
    happened_at = models.DateTimeField(default=datetime.now)