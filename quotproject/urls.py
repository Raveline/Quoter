from django.conf.urls import patterns, include, url
from quoter import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'quotproject.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'quoter.views.home', name='home'),
    url(r'^login$', 'quoter.views.quoterLogin'),
    url(r'^logout$', 'quoter.views.quoterLogout'),
    url(r'^author/new', 'quoter.views.addAuthor'),
    url(r'^author/all', 'quoter.views.getAuthors'),
    url(r'^author/load/(?P<author_id>\d+)$', 'quoter.views.loadAuthor'),
    url(r'^author/(?P<source_id>\d+)/of$', 'quoter.views.getAuthorsOf'),
    url(r'^author/update/(?P<author_id>\d+)$', 'quoter.views.updateAuthor'),
    url(r'^author/(?P<author_id>\d+)/delete$', 'quoter.views.deleteAuthor'),
    url(r'^source/new', 'quoter.views.addSource'),
    url(r'^source/all', 'quoter.views.getSources'),
    url(r'^source/load/(?P<source_id>\d+)$', 'quoter.views.loadSource'),
    url(r'^source/update/(?P<source_id>\d+)$', 'quoter.views.updateSource'),
    url(r'^source/(?P<source_id>\d+)/delete$', 'quoter.views.deleteSource'),
    url(r'^quote/new', 'quoter.views.addQuote'),
    url(r'^quote/(?P<quote_id>\d+)/update$', 'quoter.views.updateQuote'),
    url(r'^quote/(?P<quote_id>\d+)/delete$', 'quoter.views.deleteQuote'),
    url(r'^find/source/(?P<source_id>\d+)$', 'quoter.views.findBySource'),
    url(r'^find/word/(?P<word>\w+)$', 'quoter.views.findByWord'),
    url(r'^find/author/(?P<author_id>\d+)$', 'quoter.views.findByAuthor'),
    url(r'^find/tag/(?P<tag_id>\d+)$', 'quoter.views.findByTag'),
    url(r'^tags/all$', 'quoter.views.poll_for_tags'),
    url(r'^tags/find/(?P<string>\w+)$', 'quoter.views.findTagsWith'),
    url(r'^folder/add$', 'quoter.views.addFolder'),
    url(r'^folder/pick$', 'quoter.views.pickFolder'),
)
