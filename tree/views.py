from django.shortcuts import render

from django.http import response
from core.models import Task
from django.http import HttpResponse

from core import get_info, getparents


def home(request):
    return HttpResponse( "<a href='tree'>Tree</a>" )


# Create your views here.
def core(request, id):
    import json

    html = "<body></body>"

    if id == "":
        id = 1

    info = json.dumps( get_info( Task.objects.get( id=int(id) ) ) )
    parents = json.dumps( getparents( Task.objects.get( id=int(id) ) ) )

    html += "<script>info=%s;parents=%s;</script>" % (info,parents)

    html += "<title>%s</title>" % Task.objects.get( id=int(id) ).title

    scripts = [
        "/static/cm.js",
        "/static/jquery.min.js",
        "/static/tree/core.js",
        "/static/timer.js",
    ]

    css = [
        "/static/tree/core.css",
        "/static/core.css",
        "/static/timer.css"
    ]

    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s
    for s in css:
        html += "<link href='%s' rel='stylesheet'/>" % s

    return HttpResponse( html )