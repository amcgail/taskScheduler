from django.shortcuts import render

# Create your views here.

from core.models import Task
from django.http import HttpResponse
from core import get_info_onlyparents


def home(request):
    import json

    cando = Task.objects.filter( estimated_time__lte = 2 ).filter( estimated_time__gt = 0 )

    info = []
    for o in cando:
        info.append( get_info_onlyparents( o ) )
    info = sorted( info, key=lambda x: x['amt'] )
    info = json.dumps(info)

    html = "<body></body>"
    html += "<script>info=%s;</script>" % (info)

    scripts = [
        "/static/jquery.min.js",
        "/static/bite/core.js",
        "/static/timer.js",
    ]

    css = [
        "/static/bite/core.css",
        "/static/core.css",
        "/static/timer.css",
    ]

    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s
    for s in css:
        html += "<link href='%s' rel='stylesheet'/>" % s

    return HttpResponse(html)