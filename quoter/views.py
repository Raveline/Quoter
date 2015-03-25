import json
from django.shortcuts import render, redirect
from django.http import HttpResponse
from quoter.models import Author, Source, Quote, SourceMetadata, SourceInfos, Tag, Folder
from django.utils.safestring import mark_safe
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, get_user, login, logout


# NAVIGATION

def home(request):
    """If a user is connected, return Quoter main interface. If not, ask
    for login."""
    if not request.user.is_authenticated():
        return printHome(request, "Please login to continue.")
    else:
        return userHome(request)


def quoterLogin(request):
    """Process login information. If credentials or request are not as
    needed, return always the same error message, without precisions."""
    if request.method == 'POST':
        if mustHaveFields(["login", "password"], request.POST):
            user = checkUser(request.POST["login"], request.POST["password"])
            if user is not None:
                login(request, user)
                folder_check(request)
                return redirect('/')
    return errorHome(request)


def errorHome(request):
    """Shortcut for error during login."""
    return printHome(request, "Cannot authentificate you. Please retry.")


def printHome(request, message):
    """Shortcut for printing the login page."""
    return render(request, 'quoter/login.html', {'message': message})


def userHome(request):
    """Display the main page. Quoter being a browser-app, almost everything
    is displayed in one page. However, if we do not have a connected user, we will
    have to redirect to a login and database selection page."""
    context = {'folders': get_folders_for(request),
               'tags': json_string_for_tags(request),
               'current_folder_name': get_current_folder_name(request)}
    return render(request, 'quoter/quoter.html', context)


def quoterLogout(request):
    logout(request)
    return redirect('home')


# Services
@login_required
def addAuthor(request):
    """Read a form containing authors values. Every values must be here, but null
    values will be accepted. Saves in the databases and return a successful
    JSON message. If we tried to get from the URL or the fields are not complete,
    we return a failure message."""
    if request.method == 'POST':
        if mustHaveFields(["first_name", "last_name", "surname"], request.POST):
            folder_id = get_current_folder_id(request)
            new_author = Author(first_name=request.POST["first_name"],
                                last_name=request.POST["last_name"],
                                surname=request.POST["surname"],
                                folder_id=folder_id)
            new_author.save()
            return json_creation_success(new_author)
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')


@login_required
def addSource(request):
    if request.method == 'POST':
        if mustHaveFields(["authors", "title", "metadata"], request.POST):
            try:
                authors = read_authors(request.POST["authors"])
                title = request.POST["title"]
                metadata = read_metadatas(request.POST["metadata"])
                folder_id = get_current_folder_id(request)
                source = Source(title=title, folder_id=folder_id)
                source.save()
                source.authors = authors
                source.metadatas = metadata
                return json_creation_success(source)
            except Exception as e:
                return json_error(str(e))
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')


@login_required
def addQuote(request):
    if request.method == 'POST':
        if mustHaveFields(['source', 'authors', 'content',
                           'page', 'tags', 'comment'], request.POST):
            source = request.POST['source']
            authors = read_authors(request.POST['authors'])
            tags = read_tags(request, request.POST['tags'])
            content = request.POST['content']
            page = request.POST['page']
            comment = request.POST['comment']
            folder_id = get_current_folder_id(request)
            quote = Quote(content=content,
                          source_id=source,
                          page=page,
                          comment=comment,
                          folder_id=folder_id)
            quote.save()
            quote.authority = authors
            quote.tags = tags
            return json_success("Added : " + str(source))
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')


@login_required
def poll_for_tags(request, tags):
    result = {'result': 'success',
              'data': json_string_for_tags(request)}
    return json_response(result)


@login_required
def updateAuthor(request, author_id):
    to_modify = Author.objects.get(pk=author_id,
                                   folder_id=get_current_folder_id(request))
    to_modify.first_name = request.POST["first_name"]
    to_modify.last_name = request.POST["last_name"]
    to_modify.surname = request.POST["surname"]
    to_modify.save()
    return json_creation_success(to_modify)


@login_required
def updateSource(request, source_id):
    to_modify = Source.objects.get(pk=source_id,
                                   folder_id=get_current_folder_id(request))
    authors = read_authors(request.POST["authors"])
    metadata = read_metadatas(request.POST["metadata"])
    to_modify.title = request.POST["title"]
    to_modify.authors = authors
    to_modify.metadata = metadata
    to_modify.save()
    return json_creation_success(to_modify)


@login_required
def updateQuote(request, quote_id):
    to_modify = Quote.objects.get(pk=quote_id,
                                  folder_id=get_current_folder_id(request))
    to_modify.authors = read_authors(request.POST['authors'])
    to_modify.source_id = request.POST['source']
    to_modify.tags = read_tags(request, request.POST['tags'])
    to_modify.content = request.POST['content']
    to_modify.page = request.POST['page']
    to_modify.comment = request.POST['comment']
    to_modify.save()
    return json_creation_success(to_modify)


@login_required
def getAuthors(request):
    authors = Author.objects.filter(folder_id=get_current_folder_id(request))
    response = {'result': 'success',
                'data': jsonify_object_array(authors)}
    return json_response(response)


@login_required
def getAuthorsOf(request, source_id):
    response = {'result': 'success',
                'data': jsonify_object_array(Source.objects.get(pk=source_id).
                                             authors.all())}
    return json_response(response)


@login_required
def getSources(request):
    sources = Source.objects.filter(folder_id=get_current_folder_id(request))
    response = {'result': 'sucess',
                'data': jsonify_object_array(sources)}
    return json_response(response)


@login_required
def loadAuthor(request, author_id):
    author = Author.objects.get(folder_id=get_current_folder_id(request),
                                pk=author_id)
    response = {'result': 'success', 'data': author.to_dict()}
    return json_response(response)


@login_required
def loadSource(request, source_id):
    source = Source.objects.get(folder_id=get_current_folder_id(request),
                                pk=source_id)
    response = {'result': 'success', 'data': source.to_dict()}
    return json_response(response)


@login_required
def loadQuote(request, quote_id):
    quote = Quote.objects.get(folder_id=get_current_folder_id(request),
                              pk=quote_id)
    response = {'result': 'success', 'data': quote.to_dict()}
    return json_response(response)


@login_required
def findBySource(request, source_id):
    folder_id = get_current_folder_id(request)
    return json_quotes(Quote.objects.filter(source_id=source_id,
                                            folder_id=folder_id))


@login_required
def findByWord(request, word):
    folder_id = get_current_folder_id(request)
    return json_quotes(Quote.objects.filter(content__contains=word,
                                            folder_id=folder_id))


@login_required
def findByAuthor(request, author_id):
    folder_id = get_current_folder_id(request)
    return json_quotes(Quote.objects.filter(authority__id__contains=author_id,
                                            folder_id=folder_id))


@login_required
def findByTag(request, tag_id):
    folder_id = get_current_folder_id(request)
    return json_quotes(Quote.objects.filter(tags__id__contains=tag_id,
                                            folder_id=folder_id))


@login_required
def findTagsWith(request, string):
    folder_id = get_current_folder_id(request)
    tags = Tag.objects.filter(name__icontains=string, folder_id=folder_id)
    response = jsonify_object_array(tags)
    return json_response(response)


@login_required
def addFolder(request):
    folder_name = request.POST['new-folder-name']
    user = get_user(request)
    folder = Folder(name=folder_name, user=user)
    folder.save()
    set_folder_to(request, folder.pk)
    return json_success('Added folder.')


@login_required
def pickFolder(request):
    folder_id = request.POST['existing-folder']
    user = get_user(request)
    folder = Folder.objects.get(pk=folder_id)
    if folder.user == user:
        set_folder_to(request, folder_id)
    return json_success('Changed folder.')


@login_required
def deleteQuote(request):
    pass


@login_required
def deleteSource(request):
    pass


@login_required
def deleteAuthor(request):
    pass


# UTILS
# Param handling
def mustHaveFields(fields, parameters):
    """Check that a list of post parameters contains all the fields."""
    for field in fields:
        if field not in parameters:
            return False
    return True


def read_tags(request, tags_string):
    """Receive a series of tags, that can be stored as integer or string.
    If it's an integer : we already stored this tag. If it's a string, it's
    a new one and we have to record it."""
    tags = []
    preparsed = tags_string.replace("'", "\"")
    parsed = json.loads(preparsed)
    identified = [p for p in parsed if p['value'] != 'new']
    to_add = [p for p in parsed if p['value'] == 'new']
    folder_id = get_current_folder_id(request)

    for t in to_add:
        tag = Tag(name=t['display'], folder_id=folder_id)
        tag.save()
        tags.append(tag)
    for t in identified:
        if isinstance(t['value'], int) or t['value'].isdigit():
            tags.append(Tag.objects.get(pk=int(t['value'])))

    return tags


def read_authors(authors_string):
    authors_keys = map(int, authors_string.split(","))
    return Author.objects.in_bulk(authors_keys).values()


def read_metadatas(metadatas_string):
    metadatas_dictionary = transform_metadatas_to_dict(metadatas_string)
    metadatas_with_objects = {}
    # We get or add the metadatas
    for metadata in metadatas_dictionary:
        obj, cr = SourceMetadata.objects.get_or_create(
            name__icontains=metadata.lower(),
            defaults={'name': metadata}
        )
        metadatas_with_objects[obj] = metadatas_dictionary[metadata]
    # We save the metadata values
    infos = []
    for metadata_object in metadatas_with_objects:
        info = SourceInfos(metadata=metadata_object,
                           value=metadatas_with_objects[metadata_object])
        info.save()
        infos.append(info)
    return infos


def transform_metadatas_to_dict(metadatas_string):
    if len(metadatas_string) > 0:
        preparsed = metadatas_string.replace("'", "\"")
        return json.loads(preparsed)
    else:
        return {}


# Auth related
def checkUser(login, typed_password):
    user = authenticate(username=login, password=typed_password)
    if user is not None and user.is_active:
        return user
    else:
        return None


# Folder-related
def folder_check(request):
    """Done when a user connect. Check this user folder to pick a default one.
    If user has no folder, create a default one."""
    folder = None
    user = get_user(request)
    folders = Folder.objects.filter(user=user)
    if len(folders) == 0:
        defaultFolder = Folder(name="Default", user=user)
        defaultFolder.save()
        folder = defaultFolder
    else:
        folder = folders[0]
    set_folder_to(request, folder.pk)


def set_folder_to(request, folder):
    request.session['folder'] = folder


def get_folders_for(request):
    user = get_user(request)
    result = []
    folders = Folder.objects.filter(user=user)
    for f in folders:
        result.append({'display': f.name, 'value': str(f.pk)})
    return mark_safe(json.dumps(result))


def get_current_folder_id(request):
    return request.session['folder']


def get_current_folder_name(request):
    return Folder.objects.get(pk=get_current_folder_id(request)).name


# Json
def jsonify_object_array(object_array):
    all_objects = []
    for item in object_array:
        all_objects.append({'value': item.pk, 'display': str(item)})
    return all_objects


def jsonify_quote_array(quote_array):
    all_quotes = []
    for quote in quote_array:
        all_quotes.append({'content': quote.content,
                           'source': str(quote.source),
                           'value': quote.pk,
                           'tags': [str(tag) for tag in quote.tags.all()],
                           'page': quote.page})
    return all_quotes


def json_string_for_tags(request):
    """Return every existing tag in a nice, json-like string, so that
    our javascript is able to handle it."""
    folder_id = get_current_folder_id(request)
    tags = Tag.objects.filter(folder_id=folder_id)
    result = []
    for tag in tags:
        result.append({'display': tag.name, 'value': str(tag.pk)})
    return mark_safe(json.dumps(result))


def json_quotes(quotes):
    response = {'result': 'success',
                'data': jsonify_quote_array(quotes)}
    return json_response(response)


def json_creation_success(obj):
    '''Create a JSON response to inform the client an object
    has been successfuly created.

    The JSON message will contains 'success' for the result field, and the
    necessary information on the created object in the newObject field.

    The parameter must be a Django model object, so that we can make
    a string out of it, and we can have give its primary key.'''
    response = {}
    response['result'] = 'success'
    response['newObject'] = {'display': str(obj), 'value': obj.pk}
    return json_response(response)


def json_success(msg):
    response = {}
    response['result'] = 'success'
    response['msg'] = msg
    return json_response(response)


def json_error(msg):
    response = {}
    response['result'] = 'failure'
    response['msg'] = msg
    return json_response(response)


def json_response(data):
    return HttpResponse(json.dumps(data), content_type="application/json")
