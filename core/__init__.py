def calc_time_spent( t ):
    import datetime
    if t.end is None:
        return(datetime.datetime.now() - t.start.replace(tzinfo=None)).total_seconds()
    else:
        return (t.end - t.start).total_seconds()


def get_info( me ):
    from core.models import Task, TimeTrack2, QuickListRelation
    children = Task.objects.filter( parent=me )

    jc = []
    for c in children:
        jc.append( get_info(c) )


    from core.models import TimeTrack2

    all = TimeTrack2.objects.filter(task=me)

    time_spent = 0
    for t in all:
        time_spent += calc_time_spent(t)

    import datetime

    today_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    time_spent_today = 0
    for t in all.filter(start__gt=today_min):
        time_spent_today += calc_time_spent( t )

    now = datetime.datetime.now()
    bweek = now - datetime.timedelta(days=now.weekday())
    this_week_min = datetime.datetime.combine(bweek.date(), datetime.time.min)
    time_spent_this_week = 0
    for t in all.filter(start__gt=this_week_min):
        time_spent_this_week += calc_time_spent(t)

    in_today = ( len( QuickListRelation.objects.filter(member=me, list_id=1) ) > 0 )

    return {
        "id": me.id,
        "title": me.title,
        "amt": me.estimated_time,
        "used": time_spent,
        "used_day": time_spent_today,
        "used_week": time_spent_this_week,
        "in_today": in_today,
        "parents": getparents(me),
        "children": jc
    }


def get_info_onlyparents( me ):
    from core.models import TimeTrack2

    all = TimeTrack2.objects.filter(task=me)

    time_spent = 0
    for t in all:
        time_spent += calc_time_spent(t)



    import datetime
    today_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    time_spent_today = 0
    for t in all.filter(start__gt=today_min):
        time_spent_today += calc_time_spent(t)

    now = datetime.datetime.now()
    bweek = now - datetime.timedelta( days=now.weekday() )
    this_week_min = datetime.datetime.combine(bweek.date(), datetime.time.min)
    time_spent_this_week = 0
    for t in all.filter(start__gt=this_week_min):
        time_spent_this_week += calc_time_spent(t)

    return {
        "id": me.id,
        "title": me.title,
        "amt": me.estimated_time,
        "used": time_spent,
        "used_day": time_spent_today,
        "used_week": time_spent_this_week,
        "parents": getparents(me)
    }


def getparents( obj ):
    from core.models import Task
    me = {
        "id": obj.id,
        "title": obj.title
    }
    if obj.parent_id is None:
        return [me]

    mydad = Task.objects.get( id=obj.parent_id )
    return [me] + getparents(mydad)