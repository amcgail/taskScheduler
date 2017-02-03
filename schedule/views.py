from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse


def home(request):
    import json

    html = "<body></body>"

    scripts = [
        "/static/jquery.min.js",
        "/static/schedule/core.js",
        "/static/timer.js",
    ]

    css = [
        "/static/schedule/core.css",
        "/static/core.css",
        "/static/timer.css",
    ]

    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s
    for s in css:
        html += "<link href='%s' rel='stylesheet'/>" % s

    return HttpResponse(html)