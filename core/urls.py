from django.conf.urls import url, include
import views

urlpatterns = [
    url(r'^timerlog$', views.timerlog),
    url(r'^timestart$', views.timestart),
    url(r'^timeend$', views.timeend),
    url(r'^gettimes$', views.gettimes),
    url(r'^newtime$', views.newtime),
    url(r'^getcurrenttime$', views.getcurrenttime),
    url(r'^deletetime$', views.deletetime),
]