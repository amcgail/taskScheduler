# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-07-21 15:42
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20160721_1507'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='link',
            name='fr',
        ),
        migrations.RemoveField(
            model_name='link',
            name='to',
        ),
        migrations.DeleteModel(
            name='Link',
        ),
    ]
