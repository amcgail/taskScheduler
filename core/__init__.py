def get_info( me ):
    from core.models import Task, TimeTrack
    children = Task.objects.filter( parent=me )

    jc = []
    for c in children:
        jc.append( get_info(c) )

    time_spent = 0
    for t in TimeTrack.objects.filter( task=me ):
        time_spent += t.amt

    return {
        "id": me.id,
        "title": me.title,
        "amt": me.estimated_time,
        "used": time_spent,
        "children": jc
    }


def get_info_onlyparents( me ):
    from core.models import TimeTrack
    time_spent = 0
    for t in TimeTrack.objects.filter( task=me ):
        time_spent += t.amt

    return {
        "id": me.id,
        "title": me.title,
        "amt": me.estimated_time,
        "used": time_spent,
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