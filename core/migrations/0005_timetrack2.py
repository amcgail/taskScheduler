# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-09 14:11
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_timetrack'),
    ]

    operations = [
        migrations.CreateModel(
            name='TimeTrack2',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField(blank=True, null=True)),
                ('end', models.DateTimeField(blank=True, null=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Task')),
            ],
        ),
    ]
