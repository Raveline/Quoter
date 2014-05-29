// A global object for user navigation
navigation = undefined;

// Tabs order constant
FIND_QUOTE = 0;
NEW_QUOTE = 1;
NEW_SOURCE = 2;
NEW_AUTHOR = 3;
EXTRACT = 4;
STATS = 5;

function quoter_init(tags) {
        // A navigation object will keep in memory the current-status
        var tabs = $("#main-menu a").map(function(){return $(this).attr("href");}).get();
        navigation = new Navigation(tabs);

        init_tags(tags);

        // Tabs
        $('#main-menu a').click(function(e) {
            e.preventDefault();
            navigation.set_current_tab_by_href($(this).attr('href'));
            });

        // Form shortcuts buttons
        $('.input-group-btn').on('click', 'button#button-new-author', function(e) {
            e.preventDefault();
            navigation.switch_to_tab(NEW_AUTHOR);
            });

        $('.input-group-btn').on('click', 'button#button-new-source', function(e) {
            e.preventDefault();
            navigation.switch_to_tab(NEW_SOURCE);
            });

        // Infinite metadatas
        $('#metadata-container').on('change', 'input.metadata-last', function(e) {
                generate_new_metadatas();
                });

        // Infinite authors
        $('#source-author-add').click(function(e) {
                generate_new_author();
                });

        // Author update on quote form
        $('#quote-add-source').on('change', function(e) {
            var id_source = $('#quote-add-source').val();
            ajax_from("/author/" + id_source + "/of/", updateQuoteAuthors);
        });

        // Tag removing
        $('#quote-tag-container').on('click','a.tag-remover', function(e) {
            e.preventDefault();
            var clicked = $(this);
            var connected_tag = clicked.attr('connected-tag');
            clicked.parent().remove();
            removeTag(connected_tag);
        });

        // Forms
        $('#quote-add form').submit(function(e) {
                e.preventDefault();
                save_a_quote();
                });

        $('#author-add form').submit(function(e) {
                e.preventDefault();
                save_an_author();
                });

        $('#source-add form').submit(function(e) {
                e.preventDefault();
                save_a_source();
                });

        // Find forms
        $('#findByWord').click(function(e) {
            e.preventDefault();
            var word = $('input[name="find-word"]').val();
            search("/find/word/" + word);
        });
        $('#findBySource').click(function(e) {
            e.preventDefault();
            var source = $('select[name="find-source"]').val();
            search("/find/source/" + source);
        });
        $('#findByAuthor').click(function(e) {
            e.preventDefault();
            var author = $('select[name="find-author"]').val();
            search("/find/author/" + author);
        });

    // Fill the select fields.
    ajax_from("author/all", updateAuthorsFields);
    ajax_from("source/all", updateSourcesFields);
};

function init_tags(tags) {
        // Bloodhound
        // constructs the suggestion engine
        var bloodhoundTag = new Bloodhound({
              datumTokenizer: Bloodhound.tokenizers.obj.whitespace('display'),
              queryTokenizer: Bloodhound.tokenizers.whitespace,
              remote: '/tags/find/%QUERY'
        });
         
        // kicks off the loading/processing of `local` and `prefetch`
        bloodhoundTag.initialize();
          
        $('#quote-tag-autocomplete.typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
        },
        {
                name: 'tags',
                displayKey: 'display',
                // `ttAdapter` wraps the suggestion engine in an adapter that
                // is compatible with the typeahead jQuery plugin
                source: bloodhoundTag.ttAdapter()
                    
        });

        $('#quote-tag-autocomplete.typeahead').on('typeahead:selected', function (e, datum) {
                $('input[name="current-tag-value"]').val(datum.pk);
        });

        // Tag adding (pressing enter after selecting a tag)
        $('#quote-tag-autocomplete').on('keypress', function(e) {
                // Awful hack, but can't see something in the typeahead API to do this any other way...
                var active_typeahead = $('.twitter-typeahead pre').attr('aria-hidden');
                if(e.which == '13' || e.which == '44' &&  active_typeahead == 'true' ) { // Enter OR comma
                    e.preventDefault();
                    var input = $('input[name="quote-tag"]');
                    var tag_name = input.val();
                    input.val('');
                    var tag_id = $('input[name="current-tag-value"]').val();
                    addTagToQuote(tag_id, tag_name);
                } else {
                    console.log("Removing tag value !");
                    $('input[name="current-tag-value"]').val('');
                }
        });
}
function search(url) {
    ajax_from(url, display_search);
}

function display_search(response) {
    var display_area = $('#quote-find-results');
    display_area.empty();
    if (response.result == 'success') {
        var data = response.data;
        for (var i = 0; i < data.length; i++) {
            var field = ['<div class="panel panel-default"><div class="panel-body">',
                        data[i].content,
                        '</div><div class="panel-footer">',
                        data[i].source,
                        '</div></div>'].join('');
            display_area.append(field);
        }
        if (data.length == 0) {
            var field = '<div class="well">No quotes to display !</div>';
            display_area.append(field);
        }
    }
}

function save_a_quote() {
    var source_value = $('select[name=source]').val();
    var author_value = $ ('select[name=author]').val().join(",");
    var quote_value = $('textarea[name=content]').val();
    var page_value = $('input[name="quote-page"]').val();
    var tags_value = $('input[name="quote-tags"]').val();
    var comment_value = $('input[name="comment"]').val();

    var data = {"source":source_value
                , "authors":author_value
                , "content":quote_value
                , "page":page_value
                , "tags":tags_value
                , "comment":comment_value };
    ajax_to("/quote/new", data, clean_quote);
}

function save_a_source() {
    var authors_value = $('select[name=source-author]').map(function(){return $(this).val();}).get().join(',');
    var title_value = $('input[name=title]').val();
    var metadatas = $('#metadata-container .row').find('input').map(function(){ return $(this).val();}).get();
    var metadatas_array = [];
    for (var i = 0; i < metadatas.length - 1; i = i +2) {
        if (metadatas[i].trim().length > 0) {
            var field_and_value = metadatas[i] + "###" + metadatas[i+1];
            metadatas_array.push(field_and_value);
        }
    }
    metadatas = metadatas_array.join('@@@');
    var data = {"authors":authors_value, "title":title_value, "metadatas":metadatas};
    ajax_to("/source/new", data, clean_source);
}

function save_an_author() {
    var first_name_value = $('input[name=author-first-name]').val();
    var last_name_value = $('input[name=author-last-name]').val();
    var surname_value = $('input[name=author-surname]').val();
    var data = {"first_name":first_name_value, "last_name":last_name_value, "surname":surname_value };
    ajax_to("/author/new", data, clean_author);
}

function ajax_from(url, callback) {
    $.get(url, function(response) {
        callback(response);
    });
}

function ajax_to(url, data, callback) {
    var jqxhr = $.post(url, data, function(response) {
            if (response.result == "success") {
                callback();
            } else {
            // alert of an error
            }
            })
    .done(function() {
            })
    .fail(function() {
            });
}

function clean_quote() {
    $('select[name=source]').val('');
    $('select[name=author]').empty();
    $('textarea[name=content]').val('');
    $('input[name=quote-tag]').val('');
    $('input[name=quote-tags]').val('');
    $('input[name=quote-page]').val('');
    $('textarea[name=comment]').val('');
}

function clean_source() {
    $('div.author-group:not(:first)').remove();
    $('input[name=title]').val('');
    $('#metadata-container .row:not(:first)').remove();
    $('#metadata-container input').val('');
    ajax_from("source/all", updateSourcesFields);
}

function clean_author() {
    $('input[name=author-first-name]').val('');
    $('input[name=author-last-name]').val('');
    $('input[name=author-surname]').val('');
    ajax_from("author/all", updateAuthorsFields);
}

function updateAuthorsFields(response) {
    updateField($('#source-add-author'), response.data);
    updateField($('select[name="find-author"]'), response.data);
}

function updateSourcesFields(response) {
    updateField($('#quote-add-source'), response.data);
    updateField($('select[name="find-source"]'), response.data);
}

function updateQuoteAuthors(response) {
    var quote_author_select = $('#quote-add-author');
    updateField(quote_author_select, response.data);
    // Select the first author
    $('#quote-add-author option:first').prop('selected', true);
}

function updateField(field, data) {
    field.empty();
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var opt = new Option(item.display, item.pk, false, false)
        field.append(opt);
    }
}

/**
 * Push a new author input for the source form
 */
function generate_new_author() {
    var author_block = $('.author-group:first');
    var adder = $('#source-author-adder');
    adder.prepend(author_block.clone());
}

/**
 * Push a new row of metadata for the source form
 */
function generate_new_metadatas() {
    // 1. remove the class from the current metadata-last
    $('input.metadata-last').removeClass('metadata-last');
    // 2. Get the last metadata index.
    var current_metadatas = $("#metadata-container input").map(function(){return $(this).attr("name");}).get();
    var last_current_metadata_value = current_metadatas[current_metadatas.length-1];
    // 3. Add the new field
    var field = ['<div class="row"><div class="col-xs-4"><input name="metadata',
        last_current_metadata_value + 1, 
        '" type="text" class="form-control" placeholder="Information"></div><div class="col-xs-4"><input name="metadata',
        last_current_metadata_value + 2,
        '" type="text" class="form-control metadata-last" placeholder="Value"></div></div>'].join('');
    $('#metadata-container').append(field);
    $('#metadata-container input[name="metadata' + last_current_metadata_value + 1 +'"]:first').focus();
}

function Navigation(potential_tabs) {
    this.tabs = potential_tabs;
    this.current_tab_index = FIND_QUOTE;
    this.previous_tab_index = undefined;
};

function addTagToQuote(tag_id, tag_name) {
    var new_value = tag_id;
    var tag_class = "label-default";
    // New tag !
    if (tag_id == '') {
        new_value = tag_name;
        tag_class = "label-warning";
    }
    appendToAllSelectedTags(new_value);

    var tag_field = ['<span class="label '
                    ,tag_class
                    ,'">'
                    ,tag_name
                    ,' <a href="#" class="tag-remover" connected-tag="',
                    ,new_value
                    ,'">X</a></span>'].join('');
    $('#quote-tag-container').append(tag_field);
}

function appendToAllSelectedTags(to_append) {
    var hiddenField = $('input[name="quote-tags"]');
    var new_value = hiddenField.val();
    if (new_value.length > 0) {
        new_value += ",";
    }
    new_value += to_append;
    setAllSelectedTags(new_value);
}

function getAllSelectedTags() {
    return $('input[name="quote-tags"]').val().split(',');
}

function setAllSelectedTags(tags) {
    $('input[name="quote-tags"]').val(tags);
}

function removeTag(value) {
    var all_tags = getAllSelectedTags();
    all_tags.splice( $.inArray(value, all_tags), 1 );
    setAllSelectedTags(all_tags.join(','));
}

Navigation.prototype.set_current_tab_by_href = function(tab_href) {
    navigation.set_current_tab(navigation.tabs.indexOf(tab_href));
}

Navigation.prototype.set_current_tab = function(tab_index) {
    this.current_tab_index = tab_index;
    $('#main-menu a[href=' + this.tabs[this.current_tab_index] + ']').tab('show');
}

Navigation.prototype.switch_to_tab = function(tab_index) {
    this.previous_tab_index = this.current_tab_index;
    this.set_current_tab(tab_index);
}

/** Django CSRF **/
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
        // Send the token to same-origin, relative URLs only.
        // Send the token only if the method warrants CSRF protection
        // Using the CSRFToken value acquired earlier
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

