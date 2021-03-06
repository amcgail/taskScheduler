"""web_edition_editor URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url(r'^tree/', include('tree.urls')),
    url(r'^node/', include('node.urls')),
    url(r'^bite/', include('bite.urls')),
    url(r'^core/', include('core.urls')),
    url(r'^recent/', include('recent.urls')),
    url(r'^quicklists/', include('quicklists.urls')),
    url(r'^schedule/', include('schedule.urls')),
]
