from django.shortcuts import render

from django.http import response

# Create your views here.
def core(request):
    html = "<body></body>"
    scripts = [
        "https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js",

        "/static/core.js",
    ]
    for s in scripts:
        html += "<script type='text/javascript' src='%s'></script>" % s

    return response.HttpResponse( html )