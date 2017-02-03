from django.conf.urls import url, include
import views

urlpatterns = [
    url(r'^addchild$', views.addchild),
    url(r'^delete$', views.delete),
    url(r'^update$', views.update),
    url(r'^movetime$', views.movetime),
    url(r'^duplicate$', views.duplicate),
]