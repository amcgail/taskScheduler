from django.shortcuts import render

# Create your views here.

from core.models import Task, TimeTrack
from django.http import HttpResponse
from core import get_info_onlyparents

from datetime import datetime
from datetime import timedelta

def home(request):
    import json

    cando = TimeTrack.objects.filter( logged_at__gt = datetime.now()-timedelta( hours=2 ) )
    cando = sorted( cando, key=lambda x: x.logged_at )
    cando = [ x.task for x in cando ]

    cando = list( set( cando ) )

    info = []
    for o in cando:
        info.append( get_info_onlyparents( o ) )
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