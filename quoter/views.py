import json
from django.shortcuts import render
from django.http import HttpResponse
from models import Author, Source, Quote, SourceMetadata, SourceInfos, Tag
from django.utils.safestring import mark_safe

########### Navigation

def home(request):
    """Display the main page. Quoter being a browser-app, almost everything
    is displayed in one page. However, if we do not have a connected user, we will
    have to redirect to a login and database selection page."""
    context = {'tags' : json_string_for_tags()}
    return render(request, 'quoter/quoter.html', context)

########### Services
def addAuthor(request):
    """Read a form containing authors values. Every values must be here, but null
    values will be accepted. Saves in the databases and return a successful
    JSON message. If we tried to get from the URL or the fields are not complete,
    we return a failure message."""
    if request.method == 'POST':
        if mustHaveFields(["first_name", "last_name",
        "surname"], request.POST):
            new_author = Author(first_name = request.POST["first_name"]
                            ,last_name = request.POST["last_name"]
                            ,surname = request.POST["surname"])
            new_author.save()
            return json_success("Added : " + str(new_author))
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')

def addSource(request):
    if request.method == 'POST':
        if mustHaveFields(["authors", "title", "metadatas"], request.POST):
            authors = read_authors(request.POST["authors"])
            title = request.POST["title"]
            metadatas = read_metadatas(request.POST["metadatas"])
            source = Source(title = title)
            source.save()
            source.authors = authors
            source.metadatas = metadatas
            return json_success("Added : " + str(source))
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')

def addQuote(request):
    if request.method == 'POST':
        if mustHaveFields(['source','authors','content', 'page', 'tags',
            'comment'], request.POST):
            source = request.POST['source']
            authors = read_authors(request.POST['authors'])
            tags = read_tags(request.POST['tags'])
            content = request.POST['content']
            page = request.POST['page']
            comment = request.POST['comment']
            quote = Quote(content = content
                        , source_id = source
                        , page = page
                        , comment = comment)
            quote.save()
            quote.authority = authors
            quote.tags = tags
            return json_success("Added : " + str(source))
        else:
            return json_error('Missing fields.')
    else:
        return json_error('Only POST accepted.')

def poll_for_tags(tags):
    result = {'result' : 'success',
                'data' : json_string_for_tags()}
    return json_response(result)

def read_authors(authors_string):
    authors_keys = map(int, authors_string.split(","))
    return Author.objects.in_bulk(authors_keys).values()

def read_tags(tags_string):
    """Receive a series of tags, that can be stored as integer or string.
    If it's an integer : we already stored this tag. If it's a string, it's
    a new one and we have to record it."""
    tags = []
    for tag in tags_string.split(","):
        if tag.isdigit():
            tags.append(Tag.objects.get(pk = int(tag)))
        else:
            t = Tag(name = tag)
            t.save()
            tags.append(t)
    return tags

def read_metadatas(metadatas_string):
    metadatas_dictionary = transform_metadatas_to_dict(metadatas_string)
    metadatas_with_objects = {}
    # We get or add the metadatas
    for metadata in metadatas_dictionary:
        obj, cr = SourceMetadata.objects.get_or_create(name__icontains =
            metadata.lower(),
            defaults = { 'name' : metadata })
        metadatas_with_objects[obj] = metadatas_dictionary[metadata]
    # We save the metadata values
    infos = []
    for metadata_object in metadatas_with_objects:
        info = SourceInfos(metadata = metadata_object,
                value = metadatas_with_objects[metadata_object])
        info.save()
        infos.append(info)
    return infos

def transform_metadatas_to_dict(metadatas_string):
    return dict(item.split("###") for item in metadatas_string.split("@@@"))

def updateAuthor(request, author_id):
    pass

def updateSource(request, source_id):
    pass

def getAuthors(request):
    response = { 'result':'success',
                'data':jsonify_object_array(Author.objects.all())}
    return json_response(response)

def getAuthorsOf(request, source_id):
    response = { 'result':'success',
                'data':jsonify_object_array(Source.objects.get(pk =
                        source_id).authors.all())}
    return json_response(response)

def getSources(request):
    response = { 'result':'sucess',
                'data':jsonify_object_array(Source.objects.all())}
    return json_response(response)

def findBySource(request, source_id):
    return json_quotes(Quote.objects.filter(source_id = source_id))

def findByWord(request, word):
    return json_quotes(Quote.objects.filter(content__contains = word))

def findByAuthor(request, author):
    return json_quotes(Quote.objects.filter(authority__id__contains =
                        author_id))

def findByTag(tag_id):
    return json_quotes(Quote.objects.filter(tags__id__contains = tag_id))

def findTagsWith(request, string):
    tags = Tag.objects.filter(name__icontains = string)
    response = jsonify_object_array(tags)
    return json_response(response)

def json_quotes(quotes):
    response = { 'result' : 'success',
                'data' : jsonify_quote_array(quotes) }
    return json_response(response)

########### Utils
def mustHaveFields(fields, parameters):
    """Check that a list of post parameters contains all the fields."""
    for field in fields:
        if not field in parameters:
            return False
    return True

def jsonify_object_array(object_array):
    all_objects = []
    for item in object_array:
        all_objects.append({'pk' : item.pk, 'display' : str(item) })
    return all_objects

def jsonify_quote_array(quote_array):
    all_quotes = []
    for quote in quote_array:
        all_quotes.append({'content': quote.content,
                    'source' : str(quote.source),
                    'page': quote.page})
    return all_quotes

def json_string_for_tags():
    """Return every existing tag in a nice, json-like string, so that
    our javascript is able to handle it."""
    tags = Tag.objects.all()
    result = []
    for tag in tags:
        result.append({'display':tag.name, 'value':str(tag.pk) })
    return mark_safe(json.dumps(result))

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
    return HttpResponse(json.dumps(data), content_type = "application/json")
